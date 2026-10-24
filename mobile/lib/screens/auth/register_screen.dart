import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final AuthService _authService = AuthService();
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();

  String _selectedSport = 'running';
  String _selectedLevel = 'intermediate';
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final height = double.tryParse(_heightController.text.trim());
    final weight = double.tryParse(_weightController.text.trim());

    try {
      await _authService.register(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
        displayName: _nameController.text.trim(),
        sport: _selectedSport,
        experienceLevel: _selectedLevel,
        heightCm: height,
        weightKg: weight,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Athlete Profile')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Container(
                padding: const EdgeInsets.all(26),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppTheme.borderSubtle, width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Athlete Onboarding',
                        style: TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Configure your baseline telemetry profile & sport discipline',
                        style: TextStyle(color: AppTheme.textDim, fontSize: 12.5),
                      ),
                      const SizedBox(height: 22),

                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.dangerRed.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline_rounded, size: 18, color: AppTheme.dangerRed),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: AppTheme.dangerRed, fontSize: 12.5),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Athlete Display Name',
                          prefixIcon: Icon(Icons.person_outline_rounded, color: AppTheme.textDim, size: 20),
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Name required' : null,
                      ),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email Address',
                          prefixIcon: Icon(Icons.email_outlined, color: AppTheme.textDim, size: 20),
                        ),
                        validator: (v) => (v == null || !v.contains('@')) ? 'Valid email required' : null,
                      ),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Password',
                          prefixIcon: Icon(Icons.lock_outline_rounded, color: AppTheme.textDim, size: 20),
                        ),
                        validator: (v) => (v == null || v.length < 6) ? 'Min 6 characters' : null,
                      ),
                      const SizedBox(height: 14),

                      // Sport selection
                      DropdownButtonFormField<String>(
                        initialValue: _selectedSport,
                        decoration: const InputDecoration(
                          labelText: 'Primary Sport',
                          prefixIcon: Icon(Icons.directions_run_rounded, color: AppTheme.textDim, size: 20),
                        ),
                        dropdownColor: AppTheme.cardDark,
                        items: const [
                          DropdownMenuItem(value: 'running', child: Text('Running / Sprinting')),
                          DropdownMenuItem(value: 'cycling', child: Text('Cycling')),
                          DropdownMenuItem(value: 'rowing', child: Text('Rowing')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedSport = val);
                        },
                      ),
                      const SizedBox(height: 14),

                      // Experience Level
                      DropdownButtonFormField<String>(
                        initialValue: _selectedLevel,
                        decoration: const InputDecoration(
                          labelText: 'Experience Level',
                          prefixIcon: Icon(Icons.military_tech_outlined, color: AppTheme.textDim, size: 20),
                        ),
                        dropdownColor: AppTheme.cardDark,
                        items: const [
                          DropdownMenuItem(value: 'beginner', child: Text('Beginner')),
                          DropdownMenuItem(value: 'intermediate', child: Text('Intermediate')),
                          DropdownMenuItem(value: 'advanced', child: Text('Advanced')),
                          DropdownMenuItem(value: 'elite', child: Text('Elite')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedLevel = val);
                        },
                      ),
                      const SizedBox(height: 14),

                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _heightController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Height (cm)',
                                prefixIcon: Icon(Icons.height_rounded, color: AppTheme.textDim, size: 20),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _weightController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Weight (kg)',
                                prefixIcon: Icon(Icons.monitor_weight_outlined, color: AppTheme.textDim, size: 20),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      AnimatedBuilder(
                        animation: _authService,
                        builder: (context, _) {
                          return SizedBox(
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _authService.isLoading ? null : _submit,
                              child: _authService.isLoading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2.5, color: AppTheme.surfaceDark),
                                    )
                                  : const Text('Create Athlete Profile'),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
