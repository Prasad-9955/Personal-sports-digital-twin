import 'metric.dart';

class SessionItem {
  final String id;
  final String athleteId;
  final DateTime recordedAt;
  final String videoFilename;
  final double? durationSec;
  final double? fps;
  final String? resolution;
  final String processingStatus; // PENDING, PROCESSING, COMPLETED, FAILED, REJECTED
  final double? qualityScore;
  final String? errorMessage;
  final bool isDemoData;
  final DateTime createdAt;
  final DateTime? completedAt;
  final List<PoseMetricItem> poseMetrics;
  final List<PerformanceMetricItem> performanceMetrics;

  SessionItem({
    required this.id,
    required this.athleteId,
    required this.recordedAt,
    required this.videoFilename,
    this.durationSec,
    this.fps,
    this.resolution,
    required this.processingStatus,
    this.qualityScore,
    this.errorMessage,
    required this.isDemoData,
    required this.createdAt,
    this.completedAt,
    this.poseMetrics = const [],
    this.performanceMetrics = const [],
  });

  factory SessionItem.fromJson(Map<String, dynamic> json) {
    return SessionItem(
      id: json['id'] ?? '',
      athleteId: json['athlete_id'] ?? '',
      recordedAt: DateTime.tryParse(json['recorded_at'] ?? '') ?? DateTime.now(),
      videoFilename: json['video_filename'] ?? '',
      durationSec: json['duration_sec'] != null ? (json['duration_sec'] as num).toDouble() : null,
      fps: json['fps'] != null ? (json['fps'] as num).toDouble() : null,
      resolution: json['resolution'],
      processingStatus: json['processing_status'] ?? 'PENDING',
      qualityScore: json['quality_score'] != null ? (json['quality_score'] as num).toDouble() : null,
      errorMessage: json['error_message'],
      isDemoData: json['is_demo_data'] ?? false,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      completedAt: json['completed_at'] != null ? DateTime.tryParse(json['completed_at']) : null,
      poseMetrics: (json['pose_metrics'] as List<dynamic>?)
              ?.map((e) => PoseMetricItem.fromJson(e))
              .toList() ??
          [],
      performanceMetrics: (json['performance_metrics'] as List<dynamic>?)
              ?.map((e) => PerformanceMetricItem.fromJson(e))
              .toList() ??
          [],
    );
  }
}
