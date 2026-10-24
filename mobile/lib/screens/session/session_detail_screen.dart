import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../models/session.dart';
import '../../widgets/quality_badge.dart';

class SessionDetailScreen extends StatelessWidget {
  final SessionItem session;

  const SessionDetailScreen({super.key, required this.session});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Session Telemetry'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Session Overview Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF1E293B),
                    Color(0xFF0F172A),
                  ],
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.25)),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentCyan.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
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
                          const Icon(Icons.calendar_today, size: 16, color: AppTheme.accentCyan),
                          const SizedBox(width: 8),
                          Text(
                            DateFormat('MMMM dd, yyyy • HH:mm').format(session.recordedAt),
                            style: const TextStyle(
                              color: AppTheme.textLight,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      if (session.qualityScore != null)
                        QualityBadge(score: session.qualityScore!),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildDetailChip(
                        Icons.timer_outlined,
                        '${session.durationSec?.toStringAsFixed(1) ?? 'N/A'}s',
                      ),
                      _buildDetailChip(
                        Icons.speed,
                        '${session.fps?.toStringAsFixed(0) ?? 'N/A'} FPS',
                      ),
                      _buildDetailChip(
                        Icons.aspect_ratio,
                        session.resolution ?? 'Video Stream',
                      ),
                      if (session.isDemoData)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amberAccent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.amberAccent.withValues(alpha: 0.4)),
                          ),
                          child: const Text(
                            'SYNTHESIZED DEMO',
                            style: TextStyle(
                              color: Colors.amberAccent,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Extracted Kinematic Pose Metrics Section
            const Row(
              children: [
                Icon(Icons.accessibility_new, color: AppTheme.accentCyan, size: 20),
                SizedBox(width: 8),
                Text(
                  'Kinematic Joint Angles',
                  style: TextStyle(
                    color: AppTheme.textLight,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (session.poseMetrics.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderSubtle),
                ),
                child: const Center(
                  child: Text(
                    'No pose metrics extracted for this session.',
                    style: TextStyle(color: AppTheme.textMuted),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: session.poseMetrics.length,
                itemBuilder: (context, idx) {
                  final m = session.poseMetrics[idx];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.cardDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppTheme.accentCyan.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(
                                _getMetricIcon(m.metricName),
                                color: AppTheme.accentCyan,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppConstants.formatMetricName(m.metricName),
                                  style: const TextStyle(
                                    color: AppTheme.textLight,
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Text(
                                      '${m.frameCount} frames sampled',
                                      style: const TextStyle(
                                        color: AppTheme.textMuted,
                                        fontSize: 11,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: AppTheme.successGreen.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        '${(m.confidence * 100).toStringAsFixed(0)}% conf',
                                        style: const TextStyle(
                                          color: AppTheme.successGreen,
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              m.metricValue.toStringAsFixed(1),
                              style: const TextStyle(
                                color: AppTheme.accentCyan,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              m.unit,
                              style: const TextStyle(
                                color: AppTheme.textMuted,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),

            const SizedBox(height: 24),

            // Performance Metrics (Cadence, Rhythm)
            if (session.performanceMetrics.isNotEmpty) ...[
              const Row(
                children: [
                  Icon(Icons.speed, color: AppTheme.accentTeal, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Performance & Cadence',
                    style: TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...session.performanceMetrics.map((pf) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.cardDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppTheme.accentTeal.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.directions_run,
                                color: AppTheme.accentTeal,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppConstants.formatMetricName(pf.metricName),
                                  style: const TextStyle(
                                    color: AppTheme.textLight,
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Method: ${pf.measurementMethod.replaceAll('_', ' ')}',
                                  style: const TextStyle(
                                    color: AppTheme.textMuted,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Text(
                          '${pf.metricValue.toStringAsFixed(0)} ${pf.unit}',
                          style: const TextStyle(
                            color: AppTheme.accentTeal,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF334155), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppTheme.textMuted),
          const SizedBox(width: 5),
          Text(
            text,
            style: const TextStyle(
              color: AppTheme.textLight,
              fontSize: 11.5,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getMetricIcon(String metricName) {
    final lower = metricName.toLowerCase();
    if (lower.contains('trunk')) return Icons.accessibility_new;
    if (lower.contains('knee')) return Icons.airline_seat_legroom_extra;
    if (lower.contains('cadence')) return Icons.directions_run;
    if (lower.contains('symmetry')) return Icons.compare_arrows;
    return Icons.tune;
  }
}
