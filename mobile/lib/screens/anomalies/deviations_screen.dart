import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../services/analytics_service.dart';
import '../../widgets/empty_state.dart';

class DeviationsScreen extends StatefulWidget {
  const DeviationsScreen({super.key});

  @override
  State<DeviationsScreen> createState() => _DeviationsScreenState();
}

class _DeviationsScreenState extends State<DeviationsScreen> {
  final AnalyticsService _analyticsService = AnalyticsService();

  @override
  void initState() {
    super.initState();
    _analyticsService.fetchAnomalies();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Biomechanical Variations'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh, color: AppTheme.accentCyan),
            onPressed: _analyticsService.fetchAnomalies,
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: _analyticsService,
        builder: (context, _) {
          if (_analyticsService.isLoading && _analyticsService.anomalies.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan));
          }

          final anomalies = _analyticsService.anomalies;
          final elevatedCount = anomalies.where((a) => a.severity == 'ELEVATED').length;
          final moderateCount = anomalies.length - elevatedCount;

          return RefreshIndicator(
            onRefresh: _analyticsService.fetchAnomalies,
            color: AppTheme.accentCyan,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Summary Banner Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0xFF1E293B),
                          Color(0xFF0F172A),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderSubtle),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.accentCyan.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.auto_graph, color: AppTheme.accentCyan, size: 20),
                            ),
                            const SizedBox(width: 12),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Variation Telemetry',
                                  style: TextStyle(
                                    color: AppTheme.textLight,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Personal baseline deviation tracking',
                                  style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            _buildStatBox(
                              label: 'Total Detected',
                              value: '${anomalies.length}',
                              valueColor: AppTheme.textLight,
                            ),
                            const SizedBox(width: 12),
                            _buildStatBox(
                              label: 'Elevated Shift',
                              value: '$elevatedCount',
                              valueColor: elevatedCount > 0 ? AppTheme.dangerRed : AppTheme.textMuted,
                            ),
                            const SizedBox(width: 12),
                            _buildStatBox(
                              label: 'Mild / Moderate',
                              value: '$moderateCount',
                              valueColor: moderateCount > 0 ? AppTheme.warningOrange : AppTheme.textMuted,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Educational Disclaimer Banner
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.accentCyan.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.2)),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline, color: AppTheme.accentCyan, size: 18),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Variations represent statistical shifts from your personal baseline history (Modified Z-score > 1.75 or Isolation Forest pattern shift). They highlight movement variance, NOT physical injury or pathology.',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.35),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Variations Section Title
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Detected Pattern Variations',
                        style: TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${anomalies.length} items',
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (anomalies.isEmpty)
                    const EmptyStateCard(
                      icon: Icons.verified_user_outlined,
                      title: 'Consistent Movement Patterns',
                      message: 'No significant variations detected relative to your personal baseline history.',
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: anomalies.length,
                      itemBuilder: (context, idx) {
                        final a = anomalies[idx];
                        final isElevated = a.severity == 'ELEVATED';
                        final badgeColor = isElevated ? AppTheme.dangerRed : AppTheme.warningOrange;
                        final delta = a.observedValue - a.expectedValue;
                        final deltaSign = delta >= 0 ? '+' : '';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.cardDark,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: badgeColor.withValues(alpha: 0.35),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: badgeColor.withValues(alpha: 0.08),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: badgeColor.withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Icon(
                                          isElevated ? Icons.priority_high : Icons.trending_up,
                                          color: badgeColor,
                                          size: 16,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Text(
                                        AppConstants.formatMetricName(a.metricName),
                                        style: const TextStyle(
                                          color: AppTheme.textLight,
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: badgeColor.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: badgeColor.withValues(alpha: 0.4)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 6,
                                          height: 6,
                                          decoration: BoxDecoration(
                                            color: badgeColor,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          a.severity,
                                          style: TextStyle(
                                            color: badgeColor,
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.bold,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                a.explanation,
                                style: const TextStyle(
                                  color: AppTheme.textLight,
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 14),
                              // Telemetry comparison chip container
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFF334155), width: 0.7),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: _buildInlineChip(
                                        label: 'Observed',
                                        value: a.observedValue.toStringAsFixed(1),
                                        color: badgeColor,
                                      ),
                                    ),
                                    Container(width: 1, height: 24, color: const Color(0xFF334155)),
                                    Expanded(
                                      child: _buildInlineChip(
                                        label: 'Baseline',
                                        value: a.expectedValue.toStringAsFixed(1),
                                        color: AppTheme.textLight,
                                      ),
                                    ),
                                    Container(width: 1, height: 24, color: const Color(0xFF334155)),
                                    Expanded(
                                      child: _buildInlineChip(
                                        label: 'Delta',
                                        value: '$deltaSign${delta.toStringAsFixed(1)}',
                                        color: badgeColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 10),
                              Align(
                                alignment: Alignment.centerRight,
                                child: Text(
                                  DateFormat('MMM dd, yyyy • HH:mm').format(a.createdAt),
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatBox({
    required String label,
    required String value,
    required Color valueColor,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF334155), width: 0.7),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                color: valueColor,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppTheme.textMuted,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInlineChip({
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(color: AppTheme.textMuted, fontSize: 9, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
