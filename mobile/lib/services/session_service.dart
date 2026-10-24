import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/session.dart';

class SessionService extends ChangeNotifier {
  static final SessionService _instance = SessionService._internal();
  factory SessionService() => _instance;
  SessionService._internal();

  final ApiClient _api = ApiClient();
  List<SessionItem> _sessions = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<SessionItem> get sessions => _sessions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchSessions() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final res = await _api.get('/sessions');
      if (res is List) {
        _sessions = res.map((e) => SessionItem.fromJson(e)).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<SessionItem> fetchSessionDetail(String sessionId) async {
    final res = await _api.get('/sessions/$sessionId');
    return SessionItem.fromJson(res);
  }

  /// Upload video using raw bytes (Uint8List). Works on Web AND native.
  Future<SessionItem> uploadVideoBytes(Uint8List bytes, String fileName) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.uploadBytes('/sessions/upload', bytes, fileName);
      final item = SessionItem.fromJson(res);
      _sessions.insert(0, item);
      return item;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<SessionItem> processSession(String sessionId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.post('/sessions/$sessionId/process');
      final updated = SessionItem.fromJson(res);
      final idx = _sessions.indexWhere((s) => s.id == sessionId);
      if (idx != -1) {
        _sessions[idx] = updated;
      }
      return updated;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
