class PoseMetricItem {
  final String id;
  final String metricName;
  final double metricValue;
  final String unit;
  final double confidence;
  final int frameCount;
  final Map<String, dynamic>? metadataJson;

  PoseMetricItem({
    required this.id,
    required this.metricName,
    required this.metricValue,
    required this.unit,
    required this.confidence,
    required this.frameCount,
    this.metadataJson,
  });

  factory PoseMetricItem.fromJson(Map<String, dynamic> json) {
    return PoseMetricItem(
      id: json['id'] ?? '',
      metricName: json['metric_name'] ?? '',
      metricValue: (json['metric_value'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit'] ?? '',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 1.0,
      frameCount: json['frame_count'] ?? 0,
      metadataJson: json['metadata_json'],
    );
  }
}

class PerformanceMetricItem {
  final String id;
  final String metricName;
  final double metricValue;
  final String unit;
  final String measurementMethod;
  final double qualityScore;

  PerformanceMetricItem({
    required this.id,
    required this.metricName,
    required this.metricValue,
    required this.unit,
    required this.measurementMethod,
    required this.qualityScore,
  });

  factory PerformanceMetricItem.fromJson(Map<String, dynamic> json) {
    return PerformanceMetricItem(
      id: json['id'] ?? '',
      metricName: json['metric_name'] ?? '',
      metricValue: (json['metric_value'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit'] ?? '',
      measurementMethod: json['measurement_method'] ?? '',
      qualityScore: (json['quality_score'] as num?)?.toDouble() ?? 100.0,
    );
  }
}
