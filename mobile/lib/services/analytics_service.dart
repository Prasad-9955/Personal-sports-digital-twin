import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/analytics.dart';

class AnalyticsService extends ChangeNotifier {
  static final AnalyticsService _instance = AnalyticsService._internal();
  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

  final ApiClient _api = ApiClient();
  List<TrendItem> _trends = [];
  List<AnomalyItem> _anomalies = [];
  List<RecommendationItem> _recommendations = [];
  List<InsightItem> _insights = [];
  bool _isLoading = false;

  List<TrendItem> get trends => _trends;
  List<AnomalyItem> get anomalies => _anomalies;
  List<RecommendationItem> get recommendations => _recommendations;
  List<InsightItem> get insights => _insights;
  bool get isLoading => _isLoading;

  Future<MetricHistory> fetchMetricHistory(String metricName) async {
    final res = await _api.get('/metrics/history/$metricName');
    return MetricHistory.fromJson(res);
  }

  Future<void> fetchTrends() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.get('/trends');
      if (res is List) {
        _trends = res.map((e) => TrendItem.fromJson(e)).toList();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAnomalies() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.get('/anomalies');
      if (res is List) {
        _anomalies = res.map((e) => AnomalyItem.fromJson(e)).toList();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchRecommendations() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.get('/recommendations');
      if (res is List) {
        _recommendations = res.map((e) => RecommendationItem.fromJson(e)).toList();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchInsights() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.get('/insights');
      if (res is List) {
        _insights = res.map((e) => InsightItem.fromJson(e)).toList();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
