class TrendItem {
  final String id;
  final String metricName;
  final String trendLabel; // IMPROVING, STABLE, DECLINING, INSUFFICIENT_DATA
  final double slope;
  final double? rSquared;
  final int observationCount;

  TrendItem({
    required this.id,
    required this.metricName,
    required this.trendLabel,
    required this.slope,
    this.rSquared,
    required this.observationCount,
  });

  factory TrendItem.fromJson(Map<String, dynamic> json) {
    return TrendItem(
      id: json['id'] ?? '',
      metricName: json['metric_name'] ?? '',
      trendLabel: json['trend_label'] ?? 'STABLE',
      slope: (json['slope'] as num?)?.toDouble() ?? 0.0,
      rSquared: (json['r_squared'] as num?)?.toDouble(),
      observationCount: json['observation_count'] ?? 0,
    );
  }
}

class AnomalyItem {
  final String id;
  final String sessionId;
  final String metricName;
  final double observedValue;
  final double expectedValue;
  final double deviationScore;
  final String severity; // INFO, MILD, ELEVATED
  final String method;
  final String explanation;
  final DateTime createdAt;

  AnomalyItem({
    required this.id,
    required this.sessionId,
    required this.metricName,
    required this.observedValue,
    required this.expectedValue,
    required this.deviationScore,
    required this.severity,
    required this.method,
    required this.explanation,
    required this.createdAt,
  });

  factory AnomalyItem.fromJson(Map<String, dynamic> json) {
    return AnomalyItem(
      id: json['id'] ?? '',
      sessionId: json['session_id'] ?? '',
      metricName: json['metric_name'] ?? '',
      observedValue: (json['observed_value'] as num?)?.toDouble() ?? 0.0,
      expectedValue: (json['expected_value'] as num?)?.toDouble() ?? 0.0,
      deviationScore: (json['deviation_score'] as num?)?.toDouble() ?? 0.0,
      severity: json['severity'] ?? 'INFO',
      method: json['method'] ?? 'modified_zscore',
      explanation: json['explanation'] ?? '',
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}

class MetricHistoryPoint {
  final String sessionId;
  final DateTime recordedAt;
  final double metricValue;
  final double confidence;
  final double? baselineValue;
  final double? baselineLower;
  final double? baselineUpper;
  final bool isAnomaly;

  MetricHistoryPoint({
    required this.sessionId,
    required this.recordedAt,
    required this.metricValue,
    required this.confidence,
    this.baselineValue,
    this.baselineLower,
    this.baselineUpper,
    required this.isAnomaly,
  });

  factory MetricHistoryPoint.fromJson(Map<String, dynamic> json) {
    return MetricHistoryPoint(
      sessionId: json['session_id'] ?? '',
      recordedAt: DateTime.tryParse(json['recorded_at'] ?? '') ?? DateTime.now(),
      metricValue: (json['metric_value'] as num?)?.toDouble() ?? 0.0,
      confidence: (json['confidence'] as num?)?.toDouble() ?? 1.0,
      baselineValue: (json['baseline_value'] as num?)?.toDouble(),
      baselineLower: (json['baseline_lower'] as num?)?.toDouble(),
      baselineUpper: (json['baseline_upper'] as num?)?.toDouble(),
      isAnomaly: json['is_anomaly'] ?? false,
    );
  }
}

class MetricHistory {
  final String metricName;
  final String unit;
  final List<MetricHistoryPoint> points;

  MetricHistory({
    required this.metricName,
    required this.unit,
    required this.points,
  });

  factory MetricHistory.fromJson(Map<String, dynamic> json) {
    return MetricHistory(
      metricName: json['metric_name'] ?? '',
      unit: json['unit'] ?? '',
      points: (json['points'] as List<dynamic>?)
              ?.map((e) => MetricHistoryPoint.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class RecommendationItem {
  final String id;
  final String? sessionId;
  final String recommendationText;
  final Map<String, dynamic> supportingMetrics;
  final String rationale;
  final bool isFallback;
  final DateTime createdAt;

  RecommendationItem({
    required this.id,
    this.sessionId,
    required this.recommendationText,
    required this.supportingMetrics,
    required this.rationale,
    required this.isFallback,
    required this.createdAt,
  });

  factory RecommendationItem.fromJson(Map<String, dynamic> json) {
    return RecommendationItem(
      id: json['id'] ?? '',
      sessionId: json['session_id'],
      recommendationText: json['recommendation_text'] ?? '',
      supportingMetrics: json['supporting_metrics'] ?? {},
      rationale: json['rationale'] ?? '',
      isFallback: json['is_fallback'] ?? false,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}

class InsightItem {
  final String id;
  final String? sessionId;
  final String insightType;
  final Map<String, dynamic> structuredFacts;
  final String generatedText;
  final bool isFallback;
  final DateTime createdAt;

  InsightItem({
    required this.id,
    this.sessionId,
    required this.insightType,
    required this.structuredFacts,
    required this.generatedText,
    required this.isFallback,
    required this.createdAt,
  });

  factory InsightItem.fromJson(Map<String, dynamic> json) {
    return InsightItem(
      id: json['id'] ?? '',
      sessionId: json['session_id'],
      insightType: json['insight_type'] ?? '',
      structuredFacts: json['structured_facts'] ?? {},
      generatedText: json['generated_text'] ?? '',
      isFallback: json['is_fallback'] ?? false,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}
