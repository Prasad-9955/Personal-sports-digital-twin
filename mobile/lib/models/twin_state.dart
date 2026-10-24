class TwinState {
  final String id;
  final String athleteId;
  final int stateVersion;
  final Map<String, dynamic> currentMetrics;
  final Map<String, dynamic> baselineSummary;
  final Map<String, dynamic> trendSummary;
  final Map<String, dynamic> deviationSummary;
  final double dataQualityIndex;
  final int totalSessionsTracked;
  final String statusSummary;
  final DateTime createdAt;

  TwinState({
    required this.id,
    required this.athleteId,
    required this.stateVersion,
    required this.currentMetrics,
    required this.baselineSummary,
    required this.trendSummary,
    required this.deviationSummary,
    required this.dataQualityIndex,
    required this.totalSessionsTracked,
    required this.statusSummary,
    required this.createdAt,
  });

  factory TwinState.fromJson(Map<String, dynamic> json) {
    return TwinState(
      id: json['id'] ?? '',
      athleteId: json['athlete_id'] ?? '',
      stateVersion: json['state_version'] ?? 1,
      currentMetrics: json['current_metrics'] ?? {},
      baselineSummary: json['baseline_summary'] ?? {},
      trendSummary: json['trend_summary'] ?? {},
      deviationSummary: json['deviation_summary'] ?? {},
      dataQualityIndex: (json['data_quality_index'] as num?)?.toDouble() ?? 80.0,
      totalSessionsTracked: json['total_sessions_tracked'] ?? 1,
      statusSummary: json['status_summary'] ?? 'ACTIVE',
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}

class TwinOverview {
  final String athleteId;
  final String displayName;
  final String sport;
  final String experienceLevel;
  final TwinState? activeState;
  final bool hasBaseline;
  final String baselineStatusMessage;
  final int totalSessions;

  TwinOverview({
    required this.athleteId,
    required this.displayName,
    required this.sport,
    required this.experienceLevel,
    this.activeState,
    required this.hasBaseline,
    required this.baselineStatusMessage,
    required this.totalSessions,
  });

  factory TwinOverview.fromJson(Map<String, dynamic> json) {
    return TwinOverview(
      athleteId: json['athlete_id'] ?? '',
      displayName: json['display_name'] ?? 'Athlete',
      sport: json['sport'] ?? 'running',
      experienceLevel: json['experience_level'] ?? 'intermediate',
      activeState: json['active_state'] != null ? TwinState.fromJson(json['active_state']) : null,
      hasBaseline: json['has_baseline'] ?? false,
      baselineStatusMessage: json['baseline_status_message'] ?? '',
      totalSessions: json['total_sessions'] ?? 0,
    );
  }
}
