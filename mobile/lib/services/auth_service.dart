import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/athlete.dart';

class AuthService extends ChangeNotifier {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiClient _api = ApiClient();
  Athlete? _currentAthlete;
  bool _isLoading = false;

  Athlete? get currentAthlete => _currentAthlete;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _api.isAuthenticated && _currentAthlete != null;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _api.initToken();
      if (_api.isAuthenticated) {
        await fetchProfile();
      }
    } catch (_) {
      await logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String displayName,
    String sport = 'running',
    String experienceLevel = 'intermediate',
    double? heightCm,
    double? weightKg,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.post('/auth/register', body: {
        'email': email,
        'password': password,
        'display_name': displayName,
        'sport': sport,
        'experience_level': experienceLevel,
        if (heightCm != null) 'height_cm': heightCm,
        if (weightKg != null) 'weight_kg': weightKg,
      });

      final token = res['access_token'];
      await _api.setToken(token);
      await fetchProfile();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.post('/auth/login', body: {
        'email': email,
        'password': password,
      });

      final token = res['access_token'];
      await _api.setToken(token);
      await fetchProfile();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProfile() async {
    final res = await _api.get('/athletes/me');
    _currentAthlete = Athlete.fromJson(res);
    notifyListeners();
  }

  Future<void> updateProfile({
    String? displayName,
    String? sport,
    String? experienceLevel,
    double? heightCm,
    double? weightKg,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.put('/athletes/me', body: {
        if (displayName != null) 'display_name': displayName,
        if (sport != null) 'sport': sport,
        if (experienceLevel != null) 'experience_level': experienceLevel,
        if (heightCm != null) 'height_cm': heightCm,
        if (weightKg != null) 'weight_kg': weightKg,
      });
      _currentAthlete = Athlete.fromJson(res);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _api.setToken(null);
    _currentAthlete = null;
    notifyListeners();
  }
}
