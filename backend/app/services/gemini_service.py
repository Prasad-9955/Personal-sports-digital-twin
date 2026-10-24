import os
import json
import logging
import uuid
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session as DbSession
from app.config import settings
from app.models import Insight, Recommendation

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                from google.genai import types
                http_options = types.HttpOptions(
                    timeout=5000,
                    retry_options=types.HttpRetryOptions(attempts=1)
                )
                self.client = genai.Client(api_key=self.api_key, http_options=http_options)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI client: {e}")

    def generate_explanation_and_recommendations(
        self,
        db: DbSession,
        athlete_id: uuid.UUID,
        session_id: uuid.UUID,
        structured_facts: Dict[str, Any]
    ) -> Tuple[Insight, Recommendation]:
        """
        Generates natural-language coaching insights and evidence-grounded recommendations
        from verified biomechanical facts. Uses Gemini if available, or deterministic rule engine fallback.
        """
        explanation_text = ""
        recommendation_text = ""
        is_fallback = True

        if self.client and self.api_key:
            try:
                explanation_text, recommendation_text = self._call_gemini_api(structured_facts)
                is_fallback = False
            except Exception as e:
                logger.warning(f"Gemini API call failed, activating deterministic fallback: {e}")
                explanation_text, recommendation_text = self._generate_fallback(structured_facts)
                is_fallback = True
        else:
            explanation_text, recommendation_text = self._generate_fallback(structured_facts)
            is_fallback = True

        # Persist Insight
        insight = Insight(
            athlete_id=athlete_id,
            session_id=session_id,
            insight_type="SESSION_LONGITUDINAL_SUMMARY",
            structured_facts=structured_facts,
            generated_text=explanation_text,
            is_fallback=is_fallback,
            created_at=datetime.now(timezone.utc)
        )
        db.add(insight)

        # Persist Recommendation
        recommendation = Recommendation(
            athlete_id=athlete_id,
            session_id=session_id,
            recommendation_text=recommendation_text,
            supporting_metrics=structured_facts,
            rationale="Grounded directly in athlete's historical personal baseline distributions and observed session kinematics.",
            is_fallback=is_fallback,
            created_at=datetime.now(timezone.utc)
        )
        db.add(recommendation)
        db.flush()

        return insight, recommendation

    def _call_gemini_api(self, facts: Dict[str, Any]) -> Tuple[str, str]:
        """Calls Google Gemini model to convert verified facts into clear athletic feedback."""
        prompt = f"""
You are an expert sports biomechanics analyst and running coach assisting an athlete with their Personal Sports Digital Twin.
You are provided with strictly verified analytical facts for the latest session:
{json.dumps(facts, indent=2)}

INSTRUCTIONS:
1. Ground your explanation ENTIRELY in the provided numbers and baselines. Do NOT invent or recalculate any metrics.
2. Differentiate between observed values and historical baseline trends.
3. If deviations are present, explain them constructively as movement variations, NOT injuries or clinical diagnoses.
4. Output your response as valid JSON with exactly two fields:
   "insight": "A 2-3 paragraph summary explaining current metrics relative to the athlete's personal history",
   "recommendation": "1-2 actionable, safe athletic coaching drills or focus areas grounded in the observed metrics"
"""
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )
        raw_text = response.text.strip()
        # Parse JSON from response
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()

        parsed = json.loads(raw_text)
        return parsed.get("insight", ""), parsed.get("recommendation", "")

    def _generate_fallback(self, facts: Dict[str, Any]) -> Tuple[str, str]:
        """Deterministic rule-based generator ensuring high-quality, scientifically grounded output without external API dependency."""
        current = facts.get("current_metrics", {})
        baselines = facts.get("baseline_summary", {})
        trends = facts.get("trend_summary", {})
        deviations = facts.get("deviations", {})
        quality = facts.get("data_quality_score", 85.0)

        # 1. Analyze Trunk
        trunk_cur = current.get("trunk_inclination_angle", {}).get("value")
        trunk_base = baselines.get("trunk_inclination_angle", {}).get("median")
        trunk_trend = trends.get("trunk_inclination_angle", {}).get("label", "STABLE")

        # 2. Analyze Symmetry
        si_cur = current.get("bilateral_symmetry_index", {}).get("value")
        si_base = baselines.get("bilateral_symmetry_index", {}).get("median")
        si_trend = trends.get("bilateral_symmetry_index", {}).get("label", "STABLE")

        # 3. Analyze Cadence
        cad_cur = current.get("step_cadence", {}).get("value")
        cad_base = baselines.get("step_cadence", {}).get("median")

        # Build Insight Paragraphs
        paragraphs = []
        
        # General status
        if baselines:
            paragraphs.append(
                f"In this session, your movement tracking achieved a video data quality index of {quality:.0f}%. "
                f"Comparing your kinematics to your established personal baseline (based on historical sessions), your mechanical profile shows consistent longitudinal tracking."
            )
        else:
            paragraphs.append(
                f"This session was recorded with a data quality index of {quality:.0f}%. "
                f"You have recorded {facts.get('total_sessions_tracked', 1)} session(s). Complete at least 3 sessions to establish your personalized baseline."
            )

        # Kinematic breakdown
        if trunk_cur is not None and trunk_base is not None:
            diff = trunk_cur - trunk_base
            paragraphs.append(
                f"Your sagittal trunk inclination averaged {trunk_cur:.1f}° compared to your baseline median of {trunk_base:.1f}° "
                f"({abs(diff):.1f}° {'higher' if diff > 0 else 'lower'}, trend: {trunk_trend.lower()})."
            )
        elif trunk_cur is not None:
            paragraphs.append(f"Your sagittal trunk inclination averaged {trunk_cur:.1f}°.")

        if si_cur is not None and si_base is not None:
            si_diff = si_cur - si_base
            paragraphs.append(
                f"Bilateral knee symmetry index was observed at {si_cur:.1f}% versus your historical baseline of {si_base:.1f}% "
                f"(trend: {si_trend.lower()})."
            )
        elif si_cur is not None:
            paragraphs.append(f"Bilateral knee symmetry index was observed at {si_cur:.1f}%.")

        if deviations:
            anom_names = ", ".join([k.replace("_", " ") for k in deviations.keys()])
            paragraphs.append(
                f"Statistical variation was detected in {anom_names}. This variation reflects temporary session-to-session fluctuation."
            )

        explanation = " ".join(paragraphs)

        # Build Actionable Recommendation
        rec_items = []
        if si_cur is not None and si_cur > 8.0:
            rec_items.append("Focus on unilateral hip stability and single-leg glute bridges during warm-ups to promote symmetrical force transfer.")
        if trunk_cur is not None and trunk_cur > 14.0:
            rec_items.append("Maintain an upright torso posture with active core engagement to prevent excessive forward trunk inclination.")
        if cad_cur is not None and cad_cur < 160.0:
            rec_items.append("Consider incorporating short cadence drills (e.g. metronome pacing) to gently increase step frequency towards 165-175 spm.")
        
        if not rec_items:
            rec_items.append("Your kinematics align closely with your established baseline. Continue your regular progression while monitoring symmetry across training intensities.")

        recommendation = " ".join(rec_items)

        return explanation, recommendation

gemini_service = GeminiService()
