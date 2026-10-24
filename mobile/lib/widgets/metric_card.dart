import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import '../core/constants.dart';

class MetricCard extends StatelessWidget {
  final String metricKey;
  final double currentValue;
  final String unit;
  final double? baselineMedian;
  final String? trendLabel; // IMPROVING, STABLE, DECLINING
  final bool isAnomaly;
  final VoidCallback? onTap;

  const MetricCard({
    super.key,
    required this.metricKey,
    required this.currentValue,
    required this.unit,
    this.baselineMedian,
    this.trendLabel,
    this.isAnomaly = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color trendColor = AppTheme.textMuted;
    IconData trendIcon = Icons.remove;

    if (trendLabel == 'IMPROVING') {
      trendColor = AppTheme.successGreen;
      trendIcon = Icons.trending_up;
    } else if (trendLabel == 'DECLINING') {
      trendColor = AppTheme.warningOrange;
      trendIcon = Icons.trending_down;
    } else if (trendLabel == 'STABLE') {
      trendColor = AppTheme.accentCyan;
      trendIcon = Icons.trending_flat;
    }

    final delta = baselineMedian != null ? (currentValue - baselineMedian!) : null;

    IconData metricIcon = Icons.show_chart;
    if (metricKey.contains('trunk')) {
      metricIcon = Icons.accessibility_new;
    } else if (metricKey.contains('symmetry')) {
      metricIcon = Icons.balance;
    } else if (metricKey.contains('cadence')) {
      metricIcon = Icons.speed;
    } else if (metricKey.contains('knee')) {
      metricIcon = Icons.directions_run;
    }

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isAnomaly
              ? AppTheme.warningOrange.withValues(alpha: 0.5)
              : AppTheme.borderSubtle,
          width: isAnomaly ? 1.5 : 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isAnomaly
                ? AppTheme.warningOrange.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          splashColor: AppTheme.accentCyan.withValues(alpha: 0.1),
          highlightColor: AppTheme.accentCyan.withValues(alpha: 0.05),
          child: Padding(
            padding: const EdgeInsets.all(15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Top Header Row: Icon + Title + Variation Tag
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppTheme.accentCyan.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(metricIcon, size: 15, color: AppTheme.accentCyan),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        AppConstants.formatMetricName(metricKey),
                        style: const TextStyle(
                          color: AppTheme.textMuted,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isAnomaly)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.warningOrange.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.warningOrange.withValues(alpha: 0.4)),
                        ),
                        child: const Text(
                          'VARIATION',
                          style: TextStyle(
                            color: AppTheme.warningOrange,
                            fontSize: 8.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ),
                  ],
                ),

                // Main Metric Number
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        currentValue.toStringAsFixed(1),
                        style: const TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 27,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(width: 3),
                      Text(
                        unit,
                        style: const TextStyle(
                          color: AppTheme.accentCyan,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Spacer(),
                      if (delta != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: (delta.abs() < 1.0)
                                ? AppTheme.accentCyan.withValues(alpha: 0.1)
                                : (delta > 0
                                    ? AppTheme.warningOrange.withValues(alpha: 0.12)
                                    : AppTheme.successGreen.withValues(alpha: 0.12)),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${delta >= 0 ? '+' : ''}${delta.toStringAsFixed(1)}',
                            style: TextStyle(
                              color: (delta.abs() < 1.0)
                                  ? AppTheme.accentCyan
                                  : (delta > 0 ? AppTheme.warningOrange : AppTheme.successGreen),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // Bottom Footer: Baseline vs Trend
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (baselineMedian != null)
                      Text(
                        'Base: ${baselineMedian!.toStringAsFixed(1)}$unit',
                        style: const TextStyle(
                          color: AppTheme.textDim,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                        ),
                      )
                    else
                      const Text(
                        'Baseline building',
                        style: TextStyle(
                          color: AppTheme.textDim,
                          fontSize: 10.5,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    if (trendLabel != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: trendColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(trendIcon, size: 12, color: trendColor),
                            const SizedBox(width: 3),
                            Text(
                              trendLabel!,
                              style: TextStyle(
                                color: trendColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
