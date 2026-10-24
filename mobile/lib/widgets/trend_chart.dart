import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../core/app_theme.dart';
import '../models/analytics.dart';

class TrendChart extends StatelessWidget {
  final MetricHistory history;

  const TrendChart({super.key, required this.history});

  @override
  Widget build(BuildContext context) {
    final points = history.points;
    if (points.isEmpty) {
      return const Center(
        child: Text(
          'No historical sessions recorded for this metric.',
          style: TextStyle(color: AppTheme.textMuted),
        ),
      );
    }

    final spots = <FlSpot>[];
    double minY = points.first.metricValue;
    double maxY = points.first.metricValue;

    for (int i = 0; i < points.length; i++) {
      final val = points[i].metricValue;
      spots.add(FlSpot(i.toDouble(), val));
      if (val < minY) minY = val;
      if (val > maxY) maxY = val;
    }

    final baselineVal = points.last.baselineValue;
    final baselineLower = points.last.baselineLower;
    final baselineUpper = points.last.baselineUpper;

    if (baselineLower != null && baselineLower < minY) minY = baselineLower;
    if (baselineUpper != null && baselineUpper > maxY) maxY = baselineUpper;

    final yPadding = (maxY - minY) * 0.15;
    minY = (minY - yPadding).floorToDouble();
    maxY = (maxY + yPadding).ceilToDouble();
    if (minY == maxY) {
      minY -= 1.0;
      maxY += 1.0;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Legend
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            _buildLegendItem('Observed', AppTheme.accentCyan, isDashed: false),
            if (baselineVal != null) ...[
              const SizedBox(width: 12),
              _buildLegendItem('Personal Baseline', Colors.amberAccent, isDashed: true),
            ],
            const SizedBox(width: 12),
            _buildLegendItem('Variation', AppTheme.warningOrange, isDot: true),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: LineChart(
            LineChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: ((maxY - minY) / 4).clamp(1.0, 50.0),
                getDrawingHorizontalLine: (value) => const FlLine(
                  color: Color(0xFF334155),
                  strokeWidth: 0.8,
                ),
              ),
              titlesData: FlTitlesData(
                show: true,
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 28,
                    interval: 1,
                    getTitlesWidget: (value, meta) {
                      final idx = value.toInt();
                      if (idx < 0 || idx >= points.length) return const SizedBox.shrink();
                      final date = points[idx].recordedAt;
                      return Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          DateFormat('MM/dd').format(date),
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                        ),
                      );
                    },
                  ),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 38,
                    interval: ((maxY - minY) / 4).clamp(1.0, 50.0),
                    getTitlesWidget: (value, meta) {
                      return Text(
                        value.toStringAsFixed(0),
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                      );
                    },
                  ),
                ),
              ),
              borderData: FlBorderData(show: false),
              minX: 0,
              maxX: (points.length - 1).toDouble(),
              minY: minY,
              maxY: maxY,
              lineBarsData: [
                // 1. Observed Kinematics Line
                LineChartBarData(
                  spots: spots,
                  isCurved: true,
                  curveSmoothness: 0.25,
                  gradient: AppTheme.accentGradient,
                  barWidth: 3.5,
                  isStrokeCapRound: true,
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, percent, barData, index) {
                      final isAnom = (index < points.length && points[index].isAnomaly);
                      return FlDotCirclePainter(
                        radius: isAnom ? 6.5 : 4.5,
                        color: isAnom ? AppTheme.warningOrange : AppTheme.accentCyan,
                        strokeWidth: 2.5,
                        strokeColor: AppTheme.surfaceDark,
                      );
                    },
                  ),
                  belowBarData: BarAreaData(
                    show: true,
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        AppTheme.accentCyan.withValues(alpha: 0.28),
                        AppTheme.accentCyan.withValues(alpha: 0.02),
                      ],
                    ),
                  ),
                ),
                // 2. Personal Baseline Median Line
                if (baselineVal != null)
                  LineChartBarData(
                    spots: [
                      FlSpot(0, baselineVal),
                      FlSpot((points.length - 1).toDouble(), baselineVal),
                    ],
                    isCurved: false,
                    color: Colors.amberAccent.withValues(alpha: 0.85),
                    barWidth: 2,
                    dashArray: [6, 4],
                    dotData: const FlDotData(show: false),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color, {bool isDashed = false, bool isDot = false}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isDot)
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          )
        else
          Container(
            width: 14,
            height: 3,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
        ),
      ],
    );
  }
}
