import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../services/analytics_service.dart';
import '../../models/analytics.dart';
import '../../widgets/trend_chart.dart';
import '../../widgets/empty_state.dart';

class MetricTrendsScreen extends StatefulWidget {
  final String? initialMetricKey;

  const MetricTrendsScreen({super.key, this.initialMetricKey});

  @override
  State<MetricTrendsScreen> createState() => _MetricTrendsScreenState();
}

class _MetricTrendsScreenState extends State<MetricTrendsScreen> {
  final AnalyticsService _analyticsService = AnalyticsService();
  late String _selectedMetric;
  MetricHistory? _history;
  bool _isLoading = false;

  final List<String> _availableMetrics = [
    AppConstants.metricTrunkAngle,
    AppConstants.metricSymmetryIndex,
    AppConstants.metricCadence,
    AppConstants.metricKneeLeft,
    AppConstants.metricKneeRight,
  ];

  @override
  void initState() {
    super.initState();
    _selectedMetric = widget.initialMetricKey ?? AppConstants.metricSymmetryIndex;
    _loadMetricData();
  }

  Future<void> _loadMetricData() async {
    setState(() => _isLoading = true);
    await _analyticsService.fetchTrends();
    final h = await _analyticsService.fetchMetricHistory(_selectedMetric);
    if (mounted) {
      setState(() {
        _history = h;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final trendObj = _analyticsService.trends.firstWhere(
      (t) => t.metricName == _selectedMetric,
      orElse: () => TrendItem(
        id: '',
        metricName: _selectedMetric,
        trendLabel: 'INSUFFICIENT_DATA',
        slope: 0.0,
        observationCount: 0,
      ),
    );

    Color trendColor = AppTheme.textMuted;
    if (trendObj.trendLabel == 'IMPROVING') trendColor = AppTheme.successGreen;
    if (trendObj.trendLabel == 'DECLINING') trendColor = AppTheme.warningOrange;
    if (trendObj.trendLabel == 'STABLE') trendColor = AppTheme.accentCyan;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kinematic Trajectory & Baseline'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Metric Selector Pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _availableMetrics.map((key) {
                  final isSelected = key == _selectedMetric;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(AppConstants.formatMetricName(key)),
                      selected: isSelected,
                      selectedColor: AppTheme.accentCyan,
                      backgroundColor: AppTheme.cardDark,
                      side: BorderSide(
                        color: isSelected ? AppTheme.accentCyan : AppTheme.borderSubtle,
                        width: isSelected ? 1.4 : 1,
                      ),
                      labelStyle: TextStyle(
                        color: isSelected ? AppTheme.surfaceDark : AppTheme.textMuted,
                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                        fontSize: 12.5,
                      ),
                      onSelected: (val) {
                        if (val && key != _selectedMetric) {
                          setState(() => _selectedMetric = key);
                          _loadMetricData();
                        }
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),

            // Trend Status Banner
            Container(
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.borderSubtle, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(18),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppConstants.formatMetricName(_selectedMetric),
                        style: const TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Trajectory Slope: ${trendObj.slope > 0 ? '+' : ''}${trendObj.slope.toStringAsFixed(2)} / session • ${trendObj.observationCount} observations',
                        style: const TextStyle(color: AppTheme.textDim, fontSize: 12),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: trendColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: trendColor.withValues(alpha: 0.45), width: 1.2),
                    ),
                    child: Text(
                      trendObj.trendLabel,
                      style: TextStyle(
                        color: trendColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Chart Container Card
            Container(
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderSubtle, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Observed Kinematics vs Personal Baseline',
                        style: TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceDark,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          AppConstants.getMetricUnit(_selectedMetric),
                          style: const TextStyle(color: AppTheme.accentCyan, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 280,
                      child: _isLoading
                          ? const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan))
                          : (_history == null || _history!.points.isEmpty)
                              ? const EmptyStateCard(
                                  icon: Icons.show_chart,
                                  title: 'Insufficient Data',
                                  message: 'Record more sessions to display time-series trajectory.',
                                )
                              : TrendChart(history: _history!),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // Explanatory Methodology Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Analytical Methodology',
                    style: TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 14.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '• Baselines are computed as a rolling median and interquartile range (IQR) to maintain robustness against outlier frames.\n'
                    '• A metric trend is categorized as IMPROVING only when the direction of change aligns with biomechanical efficiency (e.g. lower symmetry disparity or optimal trunk angle).\n'
                    '• Orange markers highlight statistical variations (Modified Z-score > 1.75).',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.45),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
