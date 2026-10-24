import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/app_theme.dart';
import '../../services/session_service.dart';
import '../../widgets/quality_badge.dart';
import '../../widgets/empty_state.dart';
import 'session_detail_screen.dart';

class SessionHistoryScreen extends StatefulWidget {
  const SessionHistoryScreen({super.key});

  @override
  State<SessionHistoryScreen> createState() => _SessionHistoryScreenState();
}

class _SessionHistoryScreenState extends State<SessionHistoryScreen> {
  final SessionService _sessionService = SessionService();

  @override
  void initState() {
    super.initState();
    _sessionService.fetchSessions();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Session History'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh, color: AppTheme.accentCyan),
            onPressed: _sessionService.fetchSessions,
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: _sessionService,
        builder: (context, _) {
          if (_sessionService.isLoading && _sessionService.sessions.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan));
          }

          final sessions = _sessionService.sessions;

          if (sessions.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: EmptyStateCard(
                  icon: Icons.video_library_outlined,
                  title: 'No Sessions Recorded',
                  message: 'Your recorded training sessions and their biomechanical metrics will appear here.',
                  buttonText: 'Refresh',
                  onButtonPressed: _sessionService.fetchSessions,
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _sessionService.fetchSessions,
            color: AppTheme.accentCyan,
            child: ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              itemCount: sessions.length + 1,
              itemBuilder: (context, idx) {
                if (idx == 0) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.cardDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.sports_score, color: AppTheme.accentCyan, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Total Recorded Sessions',
                              style: TextStyle(
                                color: AppTheme.textLight,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.accentCyan.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            '${sessions.length}',
                            style: const TextStyle(
                              color: AppTheme.accentCyan,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final s = sessions[idx - 1];
                final isCompleted = s.processingStatus == 'COMPLETED';

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.cardDark,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () async {
                        final detail = await _sessionService.fetchSessionDetail(s.id);
                        if (context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SessionDetailScreen(session: detail),
                            ),
                          );
                        }
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isCompleted
                                    ? AppTheme.accentCyan.withValues(alpha: 0.12)
                                    : AppTheme.warningOrange.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isCompleted
                                      ? AppTheme.accentCyan.withValues(alpha: 0.25)
                                      : AppTheme.warningOrange.withValues(alpha: 0.25),
                                ),
                              ),
                              child: Icon(
                                isCompleted ? Icons.check_circle_outline : Icons.pending_outlined,
                                color: isCompleted ? AppTheme.accentCyan : AppTheme.warningOrange,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        DateFormat('MMM dd, yyyy • HH:mm').format(s.recordedAt),
                                        style: const TextStyle(
                                          color: AppTheme.textLight,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14.5,
                                        ),
                                      ),
                                      if (s.isDemoData) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: Colors.amberAccent.withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(4),
                                            border: Border.all(color: Colors.amberAccent.withValues(alpha: 0.3)),
                                          ),
                                          child: const Text(
                                            'DEMO',
                                            style: TextStyle(
                                              color: Colors.amberAccent,
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      _buildMetaTag(
                                        Icons.timer_outlined,
                                        '${s.durationSec?.toStringAsFixed(1) ?? 'N/A'}s',
                                      ),
                                      const SizedBox(width: 8),
                                      _buildMetaTag(
                                        Icons.slow_motion_video,
                                        s.processingStatus,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            if (s.qualityScore != null) ...[
                              const SizedBox(width: 8),
                              QualityBadge(score: s.qualityScore!),
                            ],
                            const SizedBox(width: 8),
                            const Icon(
                              Icons.chevron_right,
                              color: AppTheme.textMuted,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildMetaTag(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: AppTheme.textMuted),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
        ),
      ],
    );
  }
}
