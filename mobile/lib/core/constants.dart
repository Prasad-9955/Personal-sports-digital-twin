class AppConstants {
  // Configured default base URL (can be customized for emulator 10.0.2.2 or physical LAN IP)
  static const String defaultBaseUrl = 'http://localhost:8000/api/v1';
  static const String localWebBaseUrl = 'http://localhost:8000/api/v1';

  static const String appTitle = 'Personal Sports Digital Twin';
  
  // Tracked Metrics
  static const String metricTrunkAngle = 'trunk_inclination_angle';
  static const String metricSymmetryIndex = 'bilateral_symmetry_index';
  static const String metricKneeLeft = 'knee_flexion_left';
  static const String metricKneeRight = 'knee_flexion_right';
  static const String metricCadence = 'step_cadence';

  static String formatMetricName(String key) {
    switch (key) {
      case metricTrunkAngle:
        return 'Trunk Inclination';
      case metricSymmetryIndex:
        return 'Bilateral Symmetry';
      case metricKneeLeft:
        return 'Left Knee Flexion';
      case metricKneeRight:
        return 'Right Knee Flexion';
      case metricCadence:
        return 'Step Cadence';
      default:
        return key.replaceAll('_', ' ').toUpperCase();
    }
  }

  static String getMetricUnit(String key) {
    if (key.contains('angle') || key.contains('flexion')) return '°';
    if (key.contains('symmetry')) return '%';
    if (key.contains('cadence')) return 'spm';
    return '';
  }
}
