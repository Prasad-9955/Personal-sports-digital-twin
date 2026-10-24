import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class QualityBadge extends StatelessWidget {
  final double score; // 0.0 to 100.0

  const QualityBadge({super.key, required this.score});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;

    if (score >= 85.0) {
      color = AppTheme.successGreen;
      label = 'HIGH QUALITY';
    } else if (score >= 65.0) {
      color = AppTheme.warningOrange;
      label = 'MODERATE';
    } else {
      color = AppTheme.dangerRed;
      label = 'LOW CONFIDENCE';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: color.withValues(alpha: 0.45), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            '$label ${score.toStringAsFixed(0)}%',
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}
