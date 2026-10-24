import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/twin_state.dart';

class TwinService extends ChangeNotifier {
  static final TwinService _instance = TwinService._internal();
  factory TwinService() => _instance;
  TwinService._internal();

  final ApiClient _api = ApiClient();
  TwinOverview? _overview;
  List<TwinState> _history = [];
  bool _isLoading = false;
  String? _errorMessage;

  TwinOverview? get overview => _overview;
  List<TwinState> get history => _history;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchTwinOverview() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final res = await _api.get('/twin');
      _overview = TwinOverview.fromJson(res);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchTwinHistory() async {
    try {
      final res = await _api.get('/twin/history');
      if (res is List) {
        _history = res.map((e) => TwinState.fromJson(e)).toList();
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = e.toString();
    }
  }

  Future<void> seedDemoData() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _api.post('/demo/seed');
      await fetchTwinOverview();
      await fetchTwinHistory();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
