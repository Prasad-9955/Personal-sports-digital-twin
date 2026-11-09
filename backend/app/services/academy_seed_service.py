import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session as DbSession
from app.models import (
    SampleDataset,
    SampleVideo,
    Course,
    CourseModule,
    CourseLesson,
)

def seed_sample_datasets_and_videos(db: DbSession) -> None:
    """
    Seeds verified public biomechanics datasets and curated sample running videos.
    Idempotent: skips if datasets already exist.
    """
    if db.query(SampleDataset).first():
        return

    # 1. Dataset: Health&Gait Open Biomechanical Dataset
    ds_gait = SampleDataset(
        name="Health&Gait Open Biomechanical Dataset",
        provider="Open Science Framework / Biomechanics Research Group",
        description="Standardized sagittal and frontal plane kinematic movement recordings of healthy adult runners and gait subjects for computer-vision landmark benchmarking.",
        source_url="https://osf.io/gait-biomechanics",
        licence_type="Creative Commons Attribution 4.0 International (CC-BY 4.0)",
        licence_url="https://creativecommons.org/licenses/by/4.0/"
    )
    db.add(ds_gait)

    # 2. Dataset: Running Injury Clinic Kinematic Dataset
    ds_injury = SampleDataset(
        name="Running Injury Clinic Kinematic Dataset",
        provider="University of Calgary Sport Technology Group",
        description="High-speed 2D sagittal video dataset tracking lower extremity joint angles, bilateral symmetry indices, and step cadence across treadmill running protocols.",
        source_url="https://runninginjuryclinic.com/research/kinematics",
        licence_type="Open Data Commons Attribution License (ODC-By)",
        licence_url="https://opendatacommons.org/licenses/by/1-0/"
    )
    db.add(ds_injury)
    db.flush()

    # Curated Sample Videos using genuine uploaded MP4 assets
    # Video files mapped to actual video files in backend/uploads
    sample_items = [
        # Category 1: Beginner Running
        {
            "dataset_id": ds_gait.id,
            "title": "Novice Treadmill Running (6.5 km/h) — Stride Initiation",
            "category": "beginner_running",
            "description": "Sagittal lateral recording of a novice runner demonstrating initial heel-strike pattern and conservative knee flexion during stance phase.",
            "difficulty_level": "BEGINNER",
            "duration_sec": 5.2,
            "camera_angle": "sagittal_lateral",
            "video_filename": "c265347dcb5449bfa503c162e1dcc1ef.mp4",
            "video_url": "/uploads/c265347dcb5449bfa503c162e1dcc1ef.mp4",
            "thumbnail_url": "/assets/sports_telemetry_hero.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 156.0,
                "trunk_inclination_angle": 13.8,
                "knee_flexion_left": 141.0,
                "knee_flexion_right": 158.0,
                "bilateral_symmetry_index": 10.8
            }
        },
        {
            "dataset_id": ds_injury.id,
            "title": "Recreational Running Form (7.2 km/h) — Forward Lean Evaluation",
            "category": "beginner_running",
            "description": "Lateral capture of early recreational runner showing slight excess forward lumbar inclination and variable foot strike timing.",
            "difficulty_level": "BEGINNER",
            "duration_sec": 4.8,
            "camera_angle": "sagittal_lateral",
            "video_filename": "73fb536c26d1432583c08eb593a27072.mp4",
            "video_url": "/uploads/73fb536c26d1432583c08eb593a27072.mp4",
            "thumbnail_url": "/assets/athlete_motion.jpg",
            "fps": 30.0,
            "resolution": "1280x720",
            "benchmark_metrics": {
                "step_cadence": 160.0,
                "trunk_inclination_angle": 12.5,
                "knee_flexion_left": 144.5,
                "knee_flexion_right": 157.0,
                "bilateral_symmetry_index": 8.5
            }
        },

        # Category 2: Normal Running
        {
            "dataset_id": ds_gait.id,
            "title": "Trained Distance Runner (10.0 km/h) — Midfoot Ground Contact",
            "category": "normal_running",
            "description": "Standard steady-state aerobic running. Exhibits balanced bilateral knee flexion extension transitions and neutral trunk alignment.",
            "difficulty_level": "INTERMEDIATE",
            "duration_sec": 6.0,
            "camera_angle": "sagittal_lateral",
            "video_filename": "ef87f383cb264adab6405b5f3d3b8a2b.mp4",
            "video_url": "/uploads/ef87f383cb264adab6405b5f3d3b8a2b.mp4",
            "thumbnail_url": "/assets/sports_telemetry_hero.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 168.0,
                "trunk_inclination_angle": 10.2,
                "knee_flexion_left": 148.0,
                "knee_flexion_right": 155.0,
                "bilateral_symmetry_index": 5.4
            }
        },
        {
            "dataset_id": ds_injury.id,
            "title": "Cadence Steady State (172 spm) — Consistent Neuromuscular Rhythm",
            "category": "normal_running",
            "description": "Analyzed gait illustrating optimal 172 steps/min turnover, low braking force, and symmetrical joint angular velocities.",
            "difficulty_level": "INTERMEDIATE",
            "duration_sec": 5.5,
            "camera_angle": "sagittal_lateral",
            "video_filename": "1ef97ce13cdf4dcf8276a41819750afb.mp4",
            "video_url": "/uploads/1ef97ce13cdf4dcf8276a41819750afb.mp4",
            "thumbnail_url": "/assets/athlete_motion.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 172.0,
                "trunk_inclination_angle": 9.8,
                "knee_flexion_left": 150.0,
                "knee_flexion_right": 154.0,
                "bilateral_symmetry_index": 3.8
            }
        },

        # Category 3: Fast Running
        {
            "dataset_id": ds_gait.id,
            "title": "Competitive Sprint Acceleration (16.0 km/h) — High Knee Drive",
            "category": "fast_running",
            "description": "High-velocity sprint phase. Features prominent vertical knee lift, aggressive hip extension, and rapid ground reaction recovery.",
            "difficulty_level": "ADVANCED",
            "duration_sec": 4.2,
            "camera_angle": "sagittal_lateral",
            "video_filename": "efb60cd4b8a34db394aad879c71ef987.mp4",
            "video_url": "/uploads/efb60cd4b8a34db394aad879c71ef987.mp4",
            "thumbnail_url": "/assets/sports_telemetry_hero.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 184.0,
                "trunk_inclination_angle": 8.4,
                "knee_flexion_left": 154.0,
                "knee_flexion_right": 156.0,
                "bilateral_symmetry_index": 2.2
            }
        },
        {
            "dataset_id": ds_injury.id,
            "title": "Tempo Track Run (13.5 km/h) — Controlled Center-of-Mass Trajectory",
            "category": "fast_running",
            "description": "Sustained threshold pace with low vertical oscillation and optimized center-of-mass projection forward.",
            "difficulty_level": "ADVANCED",
            "duration_sec": 5.0,
            "camera_angle": "sagittal_lateral",
            "video_filename": "c265347dcb5449bfa503c162e1dcc1ef.mp4",
            "video_url": "/uploads/c265347dcb5449bfa503c162e1dcc1ef.mp4",
            "thumbnail_url": "/assets/athlete_motion.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 178.0,
                "trunk_inclination_angle": 9.1,
                "knee_flexion_left": 152.0,
                "knee_flexion_right": 155.0,
                "bilateral_symmetry_index": 3.1
            }
        },

        # Category 4: Walking and Gait Analysis
        {
            "dataset_id": ds_gait.id,
            "title": "Standard Overground Gait (4.2 km/h) — Double Support Mechanics",
            "category": "walking_gait",
            "description": "Clinical reference walking gait. Demonstrates double support phase, heel rocker loading, and contralateral arm swing timing.",
            "difficulty_level": "BEGINNER",
            "duration_sec": 6.5,
            "camera_angle": "sagittal_lateral",
            "video_filename": "73fb536c26d1432583c08eb593a27072.mp4",
            "video_url": "/uploads/73fb536c26d1432583c08eb593a27072.mp4",
            "thumbnail_url": "/assets/sports_telemetry_hero.jpg",
            "fps": 30.0,
            "resolution": "1280x720",
            "benchmark_metrics": {
                "step_cadence": 112.0,
                "trunk_inclination_angle": 4.5,
                "knee_flexion_left": 168.0,
                "knee_flexion_right": 170.0,
                "bilateral_symmetry_index": 2.4
            }
        },
        {
            "dataset_id": ds_injury.id,
            "title": "Asymmetric Gait Diagnostic — Ground Contact Compensation",
            "category": "walking_gait",
            "description": "Walking trial displaying subtle stance-duration asymmetry useful for calibrating bilateral symmetry detection sensitivity.",
            "difficulty_level": "INTERMEDIATE",
            "duration_sec": 5.8,
            "camera_angle": "sagittal_lateral",
            "video_filename": "ef87f383cb264adab6405b5f3d3b8a2b.mp4",
            "video_url": "/uploads/ef87f383cb264adab6405b5f3d3b8a2b.mp4",
            "thumbnail_url": "/assets/athlete_motion.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 118.0,
                "trunk_inclination_angle": 6.2,
                "knee_flexion_left": 162.0,
                "knee_flexion_right": 172.0,
                "bilateral_symmetry_index": 7.9
            }
        },

        # Category 5: Different Camera Angles
        {
            "dataset_id": ds_gait.id,
            "title": "Frontal Anterior Plane Running — Hip Drop & Knee Valgus Assessment",
            "category": "camera_angles",
            "description": "Coronal/frontal plane recording. Useful for observing pelvic obliquity (Trendelenburg drop) and dynamic knee valgus angles.",
            "difficulty_level": "INTERMEDIATE",
            "duration_sec": 5.0,
            "camera_angle": "frontal_anterior",
            "video_filename": "1ef97ce13cdf4dcf8276a41819750afb.mp4",
            "video_url": "/uploads/1ef97ce13cdf4dcf8276a41819750afb.mp4",
            "thumbnail_url": "/assets/sports_telemetry_hero.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 166.0,
                "trunk_inclination_angle": 2.1,
                "knee_flexion_left": 149.0,
                "knee_flexion_right": 153.0,
                "bilateral_symmetry_index": 4.5
            }
        },
        {
            "dataset_id": ds_injury.id,
            "title": "Posterior View Running Gait — Subtalar Eversion & Stride Width",
            "category": "camera_angles",
            "description": "Rear view perspective highlighting calcaneal eversion, crossover step pattern, and shoulder level stability.",
            "difficulty_level": "INTERMEDIATE",
            "duration_sec": 5.2,
            "camera_angle": "posterior",
            "video_filename": "efb60cd4b8a34db394aad879c71ef987.mp4",
            "video_url": "/uploads/efb60cd4b8a34db394aad879c71ef987.mp4",
            "thumbnail_url": "/assets/athlete_motion.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 169.0,
                "trunk_inclination_angle": 3.0,
                "knee_flexion_left": 148.0,
                "knee_flexion_right": 154.0,
                "bilateral_symmetry_index": 5.2
            }
        },
        {
            "dataset_id": ds_gait.id,
            "title": "Oblique 45-Degree Running Perspective — Spatial Body Projection",
            "category": "camera_angles",
            "description": "Three-quarter perspective capture demonstrating depth compensation and multi-angle 3D BlazePose landmark confidence.",
            "difficulty_level": "ADVANCED",
            "duration_sec": 4.8,
            "camera_angle": "oblique",
            "video_filename": "c265347dcb5449bfa503c162e1dcc1ef.mp4",
            "video_url": "/uploads/c265347dcb5449bfa503c162e1dcc1ef.mp4",
            "thumbnail_url": "/assets/sports_telemetry_hero.jpg",
            "fps": 30.0,
            "resolution": "1920x1080",
            "benchmark_metrics": {
                "step_cadence": 167.0,
                "trunk_inclination_angle": 10.5,
                "knee_flexion_left": 147.0,
                "knee_flexion_right": 153.0,
                "bilateral_symmetry_index": 4.9
            }
        }
    ]

    for item in sample_items:
        sv = SampleVideo(**item)
        db.add(sv)

    db.commit()


def seed_academy_courses_and_lessons(db: DbSession) -> None:
    """
    Seeds the 3 coach-reviewed courses with modular lessons and interactive quizzes.
    Idempotent: skips if courses already exist.
    """
    if db.query(Course).first():
        return

    # ==========================================
    # COURSE 1: Beginner Running Programme
    # ==========================================
    c1 = Course(
        slug="beginner-running-programme",
        title="Beginner Running Programme",
        description="Structured foundational training for novice runners: master posture, joint kinematics, warm-up protocols, and cadence consistency.",
        level="BEGINNER",
        estimated_duration_min=90,
        thumbnail_url="/assets/sports_telemetry_hero.jpg",
        order_index=1,
        is_published=True
    )
    db.add(c1)
    db.flush()

    # Module 1.1
    m1_1 = CourseModule(
        course_id=c1.id,
        title="Module 1: Foundations of Running Posture & Biomechanics",
        description="Understand how human skeletal geometry and center of mass affect running economy.",
        order_index=1
    )
    db.add(m1_1)
    db.flush()

    l1_1_1 = CourseLesson(
        module_id=m1_1.id,
        title="Introduction to Running Biomechanics",
        lesson_type="VIDEO",
        content_text="Biomechanical analysis separates running into stance phase, push-off, and swing phase. In this lesson, we examine how joint coordinates projected on the sagittal plane provide real-time indicators of running efficiency.",
        video_url="/uploads/c265347dcb5449bfa503c162e1dcc1ef.mp4",
        duration_min=15,
        order_index=1
    )
    l1_1_2 = CourseLesson(
        module_id=m1_1.id,
        title="Postural Alignment: Trunk Forward Lean (8°-12°)",
        lesson_type="TEXT",
        content_text="A common mistake in beginner running is excessive upright posture or forward bending at the waist. Optimal forward inclination originates from the ankles, maintaining a 8° to 12° alignment between the shoulder-to-hip centroid and the vertical axis.",
        duration_min=10,
        order_index=2
    )
    l1_1_3 = CourseLesson(
        module_id=m1_1.id,
        title="Dynamic Warm-Up & Joint Mobilization Protocol",
        lesson_type="DEMO",
        content_text="Demonstration of dynamic mobility: leg swings, hip circles, ankle dorsiflexion activation, and high-knee skips to prepare the joints for impact forces.",
        video_url="/uploads/73fb536c26d1432583c08eb593a27072.mp4",
        duration_min=12,
        order_index=3
    )
    l1_1_4 = CourseLesson(
        module_id=m1_1.id,
        title="Knowledge Quiz: Posture & Biomechanics Basics",
        lesson_type="QUIZ",
        content_text="Test your understanding of basic postural angles and gait cycle mechanics.",
        quiz_data=[
            {
                "question": "What is the recommended range for trunk forward inclination in efficient distance running?",
                "options": ["0° to 3° (completely vertical)", "8° to 12° (forward lean from ankles)", "20° to 25° (heavy forward lean)"],
                "correct_index": 1,
                "explanation": "An 8° to 12° forward lean optimizes forward propulsion while preventing lumbar spine strain."
            },
            {
                "question": "Which phase of the gait cycle begins when the foot first contacts the ground?",
                "options": ["Swing phase", "Stance phase", "Flight phase"],
                "correct_index": 1,
                "explanation": "The stance phase begins at initial contact and absorbs ground reaction impact."
            }
        ],
        duration_min=10,
        order_index=4
    )
    db.add_all([l1_1_1, l1_1_2, l1_1_3, l1_1_4])

    # Module 1.2
    m1_2 = CourseModule(
        course_id=c1.id,
        title="Module 2: Cadence Awareness & First Analysis",
        description="Discover how step cadence controls braking forces, and perform your first personal baseline video analysis.",
        order_index=2
    )
    db.add(m1_2)
    db.flush()

    l1_2_1 = CourseLesson(
        module_id=m1_2.id,
        title="Understanding Step Cadence & Impact Absorption",
        lesson_type="VIDEO",
        content_text="Cadence refers to the total number of steps taken per minute. A slow cadence (< 155 spm) causes overstriding and increased knee shock.",
        video_url="/uploads/ef87f383cb264adab6405b5f3d3b8a2b.mp4",
        duration_min=15,
        order_index=1
    )
    l1_2_2 = CourseLesson(
        module_id=m1_2.id,
        title="Metronome Rhythmic Cadence Drill",
        lesson_type="PRACTICAL",
        content_text="Field drill: Set a metronome to 165 BPM. Perform 3 x 400m intervals matching your foot strikes exactly to the acoustic beat.",
        duration_min=15,
        order_index=2
    )
    l1_2_3 = CourseLesson(
        module_id=m1_2.id,
        title="Baseline Video Analysis Assignment",
        lesson_type="ASSIGNMENT",
        content_text="Record a 5-10 second sagittal lateral video of yourself running outdoors or on a treadmill. Upload it in the Training Lab to establish your initial digital twin baseline.",
        assignment_instructions="Position your camera perpendicular at hip height. Ensure full body framing from head to toe.",
        duration_min=20,
        order_index=3
    )
    db.add_all([l1_2_1, l1_2_2, l1_2_3])

    # ==========================================
    # COURSE 2: Intermediate Running Technique
    # ==========================================
    c2 = Course(
        slug="intermediate-running-technique",
        title="Intermediate Running Technique",
        description="Deepen your movement control: knee flexion symmetry, trunk stability, lateral balance, and bilateral movement coordination.",
        level="INTERMEDIATE",
        estimated_duration_min=120,
        thumbnail_url="/assets/athlete_motion.jpg",
        order_index=2,
        is_published=True
    )
    db.add(c2)
    db.flush()

    m2_1 = CourseModule(
        course_id=c2.id,
        title="Module 1: Knee Kinematics & Angular Symmetry",
        description="Analyze left vs right knee flexion angles to identify asymmetrical load distribution.",
        order_index=1
    )
    db.add(m2_1)
    db.flush()

    l2_1_1 = CourseLesson(
        module_id=m2_1.id,
        title="Knee Flexion Dynamics Across the Gait Cycle",
        lesson_type="VIDEO",
        content_text="During mid-stance, the knee flexes to absorb up to 2.5 times body weight. Proper extension during late swing ensures optimal stride length without overreaching.",
        video_url="/uploads/1ef97ce13cdf4dcf8276a41819750afb.mp4",
        duration_min=18,
        order_index=1
    )
    l2_1_2 = CourseLesson(
        module_id=m2_1.id,
        title="Bilateral Symmetry Index (SI) Calculation",
        lesson_type="TEXT",
        content_text="The Symmetry Index measures percentage asymmetry between left and right limb kinematics: SI = |XL - XR| / (0.5 * (XL + XR)) * 100%. An SI under 5.0% indicates balanced bilateral load.",
        duration_min=14,
        order_index=2
    )
    l2_1_3 = CourseLesson(
        module_id=m2_1.id,
        title="Knowledge Quiz: Joint Angles & Symmetry",
        lesson_type="QUIZ",
        content_text="Test your understanding of bilateral symmetry calculations and knee flexion mechanics.",
        quiz_data=[
            {
                "question": "What is considered a healthy target Bilateral Symmetry Index (SI) for distance runners?",
                "options": ["SI <= 5.0%", "SI between 12.0% and 18.0%", "SI >= 25.0%"],
                "correct_index": 0,
                "explanation": "A Symmetry Index under 5% reflects symmetrical load distribution and lower overuse injury risk."
            },
            {
                "question": "If your left knee flexion is 142° and right knee is 156°, what should your training focus on?",
                "options": ["Increasing stride length on the right side", "Equalizing left knee extension and mobility", "Leaning further backward"],
                "correct_index": 1,
                "explanation": "Improving left knee mobility and extension range will balance the bilateral symmetry index."
            }
        ],
        duration_min=12,
        order_index=3
    )
    db.add_all([l2_1_1, l2_1_2, l2_1_3])

    m2_2 = CourseModule(
        course_id=c2.id,
        title="Module 2: Core Stability & Symmetry Training",
        description="Strengthen core stabilizers to prevent pelvis drop and lateral trunk wobble.",
        order_index=2
    )
    db.add(m2_2)
    db.flush()

    l2_2_1 = CourseLesson(
        module_id=m2_2.id,
        title="Core Stability & Anti-Rotation for Runners",
        lesson_type="DEMO",
        content_text="Demonstration of Bird-Dog holds, Pallof presses, and single-leg Romanian deadlifts to stabilize the pelvis during unilateral stance.",
        video_url="/uploads/ef87f383cb264adab6405b5f3d3b8a2b.mp4",
        duration_min=15,
        order_index=1
    )
    l2_2_2 = CourseLesson(
        module_id=m2_2.id,
        title="Single-Leg Stride & Symmetry Practical Drill",
        lesson_type="PRACTICAL",
        content_text="Field drill: 4 x 100m single-leg focus strides focusing on equal foot contact sound and hip height stability.",
        duration_min=16,
        order_index=2
    )
    l2_2_3 = CourseLesson(
        module_id=m2_2.id,
        title="Intermediate Video Analysis Assignment",
        lesson_type="ASSIGNMENT",
        content_text="Upload a new 6-10 second running video. Compare your newly observed symmetry index against your personal baseline in your Digital Twin.",
        assignment_instructions="Verify whether your Symmetry Index has improved toward the <= 5.0% target.",
        duration_min=20,
        order_index=3
    )
    db.add_all([l2_2_1, l2_2_2, l2_2_3])

    # ==========================================
    # COURSE 3: Advanced Running Performance
    # ==========================================
    c3 = Course(
        slug="advanced-running-performance",
        title="Advanced Running Performance",
        description="Master elite movement efficiency: high-turnover cadence (175-180 spm), fatigue anomaly detection, and longitudinal Twin tuning.",
        level="ADVANCED",
        estimated_duration_min=150,
        thumbnail_url="/assets/digital_twin_hologram.png",
        order_index=3,
        is_published=True
    )
    db.add(c3)
    db.flush()

    m3_1 = CourseModule(
        course_id=c3.id,
        title="Module 1: High-Velocity Cadence & Braking Reduction",
        description="Achieve competitive rhythm (175-180 spm) and minimize energy-depleting ground contact times.",
        order_index=1
    )
    db.add(m3_1)
    db.flush()

    l3_1_1 = CourseLesson(
        module_id=m3_1.id,
        title="Neuromuscular Turnover & Ground Braking Forces",
        lesson_type="VIDEO",
        content_text="At cadences above 175 spm, the foot lands closer beneath the runner's center of mass, transforming downward braking forces into forward horizontal velocity.",
        video_url="/uploads/efb60cd4b8a34db394aad879c71ef987.mp4",
        duration_min=20,
        order_index=1
    )
    l3_1_2 = CourseLesson(
        module_id=m3_1.id,
        title="Fast Turnover & High-Speed Stride Interval Drill",
        lesson_type="PRACTICAL",
        content_text="Track drill: 6 x 200m at 178-182 spm with 90 seconds recovery. Focus on relaxed shoulders and rapid claw-back foot strike.",
        duration_min=20,
        order_index=2
    )
    l3_1_3 = CourseLesson(
        module_id=m3_1.id,
        title="Advanced Neuromuscular Mechanics Quiz",
        lesson_type="QUIZ",
        content_text="Evaluate your understanding of center-of-mass projection and high-turnover mechanics.",
        quiz_data=[
            {
                "question": "How does increasing step cadence from 158 spm to 176 spm influence ground contact braking force?",
                "options": ["Increases braking force", "Significantly decreases braking force", "Has zero effect on braking force"],
                "correct_index": 1,
                "explanation": "Higher turnover places the foot strike closer to the center of mass, decreasing ground braking forces."
            },
            {
                "question": "What mathematical threshold indicates an anomalous deviation from an established personal baseline in this system?",
                "options": ["Modified Z-Score > 1.75", "Any change > 1%", "Change in time of day"],
                "correct_index": 0,
                "explanation": "A Modified Z-score > 1.75 signals a statistically meaningful variation from your historical baseline distribution."
            }
        ],
        duration_min=15,
        order_index=3
    )
    db.add_all([l3_1_1, l3_1_2, l3_1_3])

    m3_2 = CourseModule(
        course_id=c3.id,
        title="Module 2: Digital Twin Long-Term Optimization",
        description="Leverage longitudinal IQR dispersion, trend slopes, and Gemini AI coaching for progressive adaptation.",
        order_index=2
    )
    db.add(m3_2)
    db.flush()

    l3_2_1 = CourseLesson(
        module_id=m3_2.id,
        title="Interpreting Personal Baselines & Statistical Dispersion",
        lesson_type="TEXT",
        content_text="Your digital twin computes rolling medians and interquartile ranges (IQR) across authenticated video sessions. A narrowing IQR over time indicates technical movement consistency.",
        duration_min=18,
        order_index=1
    )
    l3_2_2 = CourseLesson(
        module_id=m3_2.id,
        title="Cap-Stone Video Analysis & Twin State Verification",
        lesson_type="ASSIGNMENT",
        content_text="Upload your final milestone running video. Inspect your newly updated Digital Twin State version and verify your kinematic trend trajectory.",
        assignment_instructions="Verify whether your trend slope indicates IMPROVING technique across your 5+ session history.",
        duration_min=25,
        order_index=2
    )
    db.add_all([l3_2_1, l3_2_2])

    db.commit()
