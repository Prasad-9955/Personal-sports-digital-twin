import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import '../models/twin_state.dart';
import 'quality_badge.dart';

class TwinStatusCard extends StatelessWidget {
  final TwinOverview overview;
  final VoidCallback? onSeedDemo;

  const TwinStatusCard({
    super.key,
    required this.overview,
    this.onSeedDemo,
  });

  @override
  Widget build(BuildContext context) {
    final state = overview.activeState;
    final isInitialized = state != null;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: AppTheme.heroTwinGradient,
        border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.25), width: 1.4),
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentCyan.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: AppTheme.accentGradient,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.accentCyan.withValues(alpha: 0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.fingerprint,
                      color: AppTheme.surfaceDark,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        overview.displayName,
                        style: const TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.accentCyan.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              overview.sport.toUpperCase(),
                              style: const TextStyle(
                                color: AppTheme.accentCyan,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            overview.experienceLevel.toUpperCase(),
                            style: const TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              if (isInitialized)
                QualityBadge(score: state.dataQualityIndex)
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.warningOrange.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.warningOrange.withValues(alpha: 0.4)),
                  ),
                  child: const Text(
                    'INITIALIZING',
                    style: TextStyle(
                      color: AppTheme.warningOrange,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 20),

          // 3 Metric Stat Pillars in Glass Containers
          Row(
            children: [
              Expanded(
                child: _buildStatTile(
                  label: 'TWIN VERSION',
                  value: isInitialized ? 'v${state.stateVersion}' : 'v0',
                  icon: Icons.auto_awesome,
                  accentColor: AppTheme.accentCyan,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildStatTile(
                  label: 'SESSIONS',
                  value: '${overview.totalSessions}',
                  icon: Icons.video_collection_outlined,
                  accentColor: AppTheme.indigoAccent,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildStatTile(
                  label: 'BASELINE',
                  value: overview.hasBaseline ? 'ACTIVE' : 'LEARNING',
                  icon: overview.hasBaseline ? Icons.verified : Icons.hourglass_top,
                  accentColor: overview.hasBaseline ? AppTheme.successGreen : AppTheme.warningOrange,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Dynamic Status Message Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.borderSubtle, width: 1),
            ),
            child: Row(
              children: [
                Icon(
                  overview.hasBaseline ? Icons.analytics_outlined : Icons.info_outline,
                  color: AppTheme.accentCyan,
                  size: 18,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    overview.baselineStatusMessage,
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 12.5,
                      height: 1.35,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Seed demo button if baseline not established
          if (!overview.hasBaseline && onSeedDemo != null) ...[
            const SizedBox(height: 14),
            InkWell(
              onTap: onSeedDemo,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.accentCyan.withValues(alpha: 0.15),
                      AppTheme.electricTeal.withValues(alpha: 0.08),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.5), width: 1),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.bolt, size: 18, color: AppTheme.accentCyan),
                    SizedBox(width: 6),
                    Text(
                      'Load 5-Session Simulated Demo Progression',
                      style: TextStyle(
                        color: AppTheme.accentCyan,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatTile({
    required String label,
    required String value,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppTheme.cardDark.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderSubtle, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 13, color: accentColor),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: AppTheme.textDim,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.4,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: accentColor,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
