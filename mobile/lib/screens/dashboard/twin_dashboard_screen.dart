import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../services/twin_service.dart';
import '../../services/analytics_service.dart';
import '../../models/twin_state.dart';
import '../../widgets/twin_status_card.dart';
import '../../widgets/metric_card.dart';
import '../../widgets/empty_state.dart';
import '../upload/video_upload_screen.dart';
import '../trends/metric_trends_screen.dart';
import '../session/session_history_screen.dart';
import '../recommendations/recommendations_screen.dart';
import '../anomalies/deviations_screen.dart';

class TwinDashboardScreen extends StatefulWidget {
  const TwinDashboardScreen({super.key});

  @override
  State<TwinDashboardScreen> createState() => _TwinDashboardScreenState();
}

class _TwinDashboardScreenState extends State<TwinDashboardScreen> {
  final TwinService _twinService = TwinService();
  final AnalyticsService _analyticsService = AnalyticsService();

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    await _twinService.fetchTwinOverview();
    await _analyticsService.fetchTrends();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_twinService, _analyticsService]),
      builder: (context, _) {
        final overview = _twinService.overview;
        final isLoading = _twinService.isLoading && overview == null;

        return Scaffold(
          appBar: AppBar(
            title: Row(
              children: [
                Container(
                  width: 9,
                  height: 9,
                  decoration: const BoxDecoration(
                    color: AppTheme.successGreen,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.successGreen,
                        blurRadius: 6,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Sports Digital Twin',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh_rounded),
                tooltip: 'Sync State',
                onPressed: _loadDashboardData,
              ),
              IconButton(
                icon: const Icon(Icons.history_rounded),
                tooltip: 'Session History',
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SessionHistoryScreen()),
                ),
              ),
            ],
          ),
          body: isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan))
              : overview == null
                  ? Center(
                      child: EmptyStateCard(
                        icon: Icons.error_outline_rounded,
                        title: 'Unable to Load Digital Twin',
                        message: _twinService.errorMessage ?? 'Connection to backend failed.',
                        buttonText: 'Retry Connection',
                        onButtonPressed: _loadDashboardData,
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadDashboardData,
                      color: AppTheme.accentCyan,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // 1. Digital Twin Status Snapshot Card
                            TwinStatusCard(
                              overview: overview,
                              onSeedDemo: () async {
                                await _twinService.seedDemoData();
                                await _analyticsService.fetchTrends();
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Simulated 5-session demo progression active!'),
                                      backgroundColor: AppTheme.successGreen,
                                    ),
                                  );
                                }
                              },
                            ),
                            const SizedBox(height: 20),

                            // Quick Navigation Action Row with Glass styling
                            Row(
                              children: [
                                Expanded(
                                  child: _buildActionButton(
                                    icon: Icons.video_call_rounded,
                                    label: 'Analyze',
                                    color: AppTheme.accentCyan,
                                    gradient: AppTheme.accentGradient,
                                    onTap: () async {
                                      final res = await Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (_) => const VideoUploadScreen()),
                                      );
                                      if (res == true) _loadDashboardData();
                                    },
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _buildActionButton(
                                    icon: Icons.psychology_rounded,
                                    label: 'Gemini AI',
                                    color: const Color(0xFFA78BFA),
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
                                    ),
                                    onTap: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const RecommendationsScreen()),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _buildActionButton(
                                    icon: Icons.tune_rounded,
                                    label: 'Variations',
                                    color: AppTheme.warningOrange,
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFFF59E0B), Color(0xFFFBBF24)],
                                    ),
                                    onTap: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const DeviationsScreen()),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // 2. Tracked Biomechanical Metrics Grid Header
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Biomechanical Telemetry',
                                      style: TextStyle(
                                        color: AppTheme.textLight,
                                        fontSize: 16.5,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.2,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Live kinematic observations vs personal baseline',
                                      style: TextStyle(
                                        color: AppTheme.textDim,
                                        fontSize: 11.5,
                                      ),
                                    ),
                                  ],
                                ),
                                TextButton.icon(
                                  onPressed: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => const MetricTrendsScreen()),
                                  ),
                                  icon: const Icon(Icons.insights_rounded, size: 16, color: AppTheme.accentCyan),
                                  label: const Text(
                                    'Charts',
                                    style: TextStyle(
                                      color: AppTheme.accentCyan,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildMetricsGrid(overview),
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),
        );
      },
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required LinearGradient gradient,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          splashColor: color.withValues(alpha: 0.15),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
            child: Column(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                const SizedBox(height: 8),
                Text(
                  label,
                  style: const TextStyle(
                    color: AppTheme.textLight,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricsGrid(TwinOverview overview) {
    final state = overview.activeState;
    if (state == null || state.currentMetrics.isEmpty) {
      return const EmptyStateCard(
        icon: Icons.monitor_weight_outlined,
        title: 'No Metrics Extracted Yet',
        message: 'Upload and process a video to extract 33 BlazePose landmarks and observe kinematic metrics.',
      );
    }

    final cur = state.currentMetrics;
    final baselines = state.baselineSummary;
    final deviations = state.deviationSummary;
    final trendsMap = {for (var t in _analyticsService.trends) t.metricName: t.trendLabel};

    final trackedKeys = [
      AppConstants.metricTrunkAngle,
      AppConstants.metricSymmetryIndex,
      AppConstants.metricCadence,
      AppConstants.metricKneeLeft,
      AppConstants.metricKneeRight,
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: trackedKeys.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.15,
      ),
      itemBuilder: (context, idx) {
        final key = trackedKeys[idx];
        final metricObj = cur[key];
        final val = (metricObj != null && metricObj['value'] != null)
            ? (metricObj['value'] as num).toDouble()
            : 0.0;
        final unit = (metricObj != null && metricObj['unit'] != null)
            ? metricObj['unit'].toString()
            : AppConstants.getMetricUnit(key);

        final bObj = baselines[key];
        final bMed = (bObj != null && bObj['median'] != null)
            ? (bObj['median'] as num).toDouble()
            : null;

        final isAnom = deviations.containsKey(key);
        final trendLabel = trendsMap[key];

        return MetricCard(
          metricKey: key,
          currentValue: val,
          unit: unit,
          baselineMedian: bMed,
          trendLabel: trendLabel,
          isAnomaly: isAnom,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => MetricTrendsScreen(initialMetricKey: key),
              ),
            );
          },
        );
      },
    );
  }
}
