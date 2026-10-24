import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/app_theme.dart';
import '../../services/analytics_service.dart';
import '../../widgets/empty_state.dart';

class RecommendationsScreen extends StatefulWidget {
  const RecommendationsScreen({super.key});

  @override
  State<RecommendationsScreen> createState() => _RecommendationsScreenState();
}

class _RecommendationsScreenState extends State<RecommendationsScreen> {
  final AnalyticsService _analyticsService = AnalyticsService();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _analyticsService.fetchRecommendations();
    await _analyticsService.fetchInsights();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Coaching Insights & Guidance'),
      ),
      body: AnimatedBuilder(
        animation: _analyticsService,
        builder: (context, _) {
          if (_analyticsService.isLoading && _analyticsService.recommendations.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan));
          }

          final recs = _analyticsService.recommendations;
          final insights = _analyticsService.insights;

          if (recs.isEmpty && insights.isEmpty) {
            return Center(
              child: EmptyStateCard(
                icon: Icons.auto_awesome,
                title: 'No Recommendations Yet',
                message: 'Recommendations and grounded natural-language insights will generate after your movement sessions are analyzed.',
                buttonText: 'Refresh',
                onButtonPressed: _loadData,
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _loadData,
            color: AppTheme.accentCyan,
            child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            children: [
              // Gemini AI Readback Hero Card
              if (insights.isNotEmpty) ...[
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.geminiAiGradient,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                      width: 1.4,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFA78BFA).withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.auto_awesome, color: Color(0xFFA78BFA), size: 18),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    insights.first.isFallback
                                        ? 'Biomechanical Rule Readback'
                                        : 'Gemini 3.8 Flash Coaching',
                                    style: const TextStyle(
                                      color: Color(0xFFDDD6FE),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  Text(
                                    insights.first.isFallback ? 'Deterministic Rule Engine' : 'Grounded AI Analysis',
                                    style: TextStyle(
                                      color: const Color(0xFFA78BFA).withValues(alpha: 0.8),
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              DateFormat('MMM dd').format(insights.first.createdAt),
                              style: const TextStyle(color: Color(0xFFC4B5FD), fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                        ),
                        child: Text(
                          insights.first.generatedText,
                          style: const TextStyle(
                            color: AppTheme.textLight,
                            fontSize: 13.5,
                            height: 1.55,
                            letterSpacing: 0.1,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Actionable Athletic Recommendations Section
              const Row(
                children: [
                  Icon(Icons.fitness_center_rounded, color: AppTheme.accentCyan, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Targeted Training Drills',
                    style: TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 16.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              ...recs.map((rec) => Container(
                    margin: const EdgeInsets.only(bottom: 14),
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                color: Colors.amberAccent.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.bolt_rounded, size: 18, color: Colors.amberAccent),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Recommended Movement Adjustment',
                                style: TextStyle(
                                  color: AppTheme.textLight,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            if (rec.isFallback)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.borderSubtle,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'RULE',
                                  style: TextStyle(color: AppTheme.textDim, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)]),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'AI INSIGHT',
                                  style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w800),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          rec.recommendationText,
                          style: const TextStyle(
                            color: AppTheme.textLight,
                            fontSize: 13.5,
                            height: 1.5,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceDark.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.psychology_outlined, size: 14, color: AppTheme.accentCyan),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Grounded Rationale: ${rec.rationale}',
                                  style: const TextStyle(
                                    color: AppTheme.textMuted,
                                    fontSize: 11.5,
                                    height: 1.35,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )),
              ],
            ),
          );
        },
      ),
    );
  }
}
