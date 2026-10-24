import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'core/constants.dart';
import 'services/auth_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/dashboard/twin_dashboard_screen.dart';
import 'screens/trends/metric_trends_screen.dart';
import 'screens/session/session_history_screen.dart';
import 'screens/profile/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final authService = AuthService();
  await authService.initialize();
  runApp(const SportsTwinApp());
}

class SportsTwinApp extends StatelessWidget {
  const SportsTwinApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    return AnimatedBuilder(
      animation: authService,
      builder: (context, _) {
        if (authService.isLoading && authService.currentAthlete == null) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: AppTheme.accentCyan),
            ),
          );
        }

        if (authService.isAuthenticated) {
          return const MainShellScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}

class MainShellScreen extends StatefulWidget {
  const MainShellScreen({super.key});

  @override
  State<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    TwinDashboardScreen(),
    MetricTrendsScreen(),
    SessionHistoryScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          border: const Border(
            top: BorderSide(color: AppTheme.borderSubtle, width: 1.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          backgroundColor: Colors.transparent,
          indicatorColor: AppTheme.accentCyan.withValues(alpha: 0.15),
          elevation: 0,
          height: 68,
          onDestinationSelected: (idx) {
            setState(() => _currentIndex = idx);
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.fingerprint_rounded, color: AppTheme.textDim),
              selectedIcon: Icon(Icons.fingerprint_rounded, color: AppTheme.accentCyan, size: 26),
              label: 'Twin',
            ),
            NavigationDestination(
              icon: Icon(Icons.insights_rounded, color: AppTheme.textDim),
              selectedIcon: Icon(Icons.insights_rounded, color: AppTheme.accentCyan, size: 26),
              label: 'Trends',
            ),
            NavigationDestination(
              icon: Icon(Icons.video_library_outlined, color: AppTheme.textDim),
              selectedIcon: Icon(Icons.video_library_rounded, color: AppTheme.accentCyan, size: 26),
              label: 'Sessions',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded, color: AppTheme.textDim),
              selectedIcon: Icon(Icons.person_rounded, color: AppTheme.accentCyan, size: 26),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
