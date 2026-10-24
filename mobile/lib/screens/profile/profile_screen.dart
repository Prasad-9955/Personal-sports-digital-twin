import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/api_client.dart';
import '../../services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();
  final ApiClient _apiClient = ApiClient();
  final _serverUrlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _serverUrlController.text = _apiClient.baseUrl;
  }

  @override
  void dispose() {
    _serverUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final athlete = _authService.currentAthlete;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Athlete Profile & Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Athlete Hero Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF1E293B),
                    Color(0xFF0F172A),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentCyan.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppTheme.accentGradient,
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0B1120),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person,
                        size: 46,
                        color: AppTheme.accentCyan,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    athlete?.displayName ?? 'Athlete',
                    style: const TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.accentCyan.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          (athlete?.sport ?? 'RUNNING').toUpperCase(),
                          style: const TextStyle(
                            color: AppTheme.accentCyan,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.successGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          (athlete?.experienceLevel ?? 'INTERMEDIATE').toUpperCase(),
                          style: const TextStyle(
                            color: AppTheme.successGreen,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Divider(color: Color(0xFF334155), height: 1),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildProfileStat(label: 'Digital Twin', value: 'Active v2.0'),
                      _buildProfileStat(label: 'Vision Model', value: 'MediaPipe Blaze'),
                      _buildProfileStat(label: 'AI Coach', value: 'Gemini 3.8 Flash'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Server Connection Settings Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.accentCyan.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.dns_outlined, color: AppTheme.accentCyan, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Backend Connection Settings',
                        style: TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Configure base URL to match your host environment (e.g. 10.0.2.2:8000 for Android emulator, or http://localhost:8000 for web & desktop):',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12.5, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _serverUrlController,
                    decoration: const InputDecoration(
                      labelText: 'API Base URL',
                      prefixIcon: Icon(Icons.link, color: AppTheme.textMuted),
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        _apiClient.setBaseUrl(_serverUrlController.text.trim());
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Row(
                              children: [
                                Icon(Icons.check_circle, color: Colors.white, size: 18),
                                SizedBox(width: 8),
                                Text('API Base URL successfully updated!'),
                              ],
                            ),
                            backgroundColor: AppTheme.successGreen,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        );
                      },
                      child: const Text('Update Connection URL'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Log Out Button
            OutlinedButton.icon(
              onPressed: () async {
                await _authService.logout();
              },
              icon: const Icon(Icons.logout, color: AppTheme.dangerRed, size: 20),
              label: const Text(
                'Log Out of Athlete Profile',
                style: TextStyle(color: AppTheme.dangerRed, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppTheme.dangerRed.withValues(alpha: 0.5)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),

            // Footer note
            Center(
              child: Text(
                'Personal Sports Digital Twin v2.0 • Biomechanical Telemetry Engine',
                style: TextStyle(
                  color: AppTheme.textMuted.withValues(alpha: 0.6),
                  fontSize: 11,
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileStat({required String label, required String value}) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.textLight,
            fontSize: 12.5,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textMuted,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
