import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException ($statusCode): $message';
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  String _baseUrl = AppConstants.defaultBaseUrl;
  String? _token;

  String get baseUrl => _baseUrl;
  void setBaseUrl(String url) {
    _baseUrl = url;
  }

  Future<void> initToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('access_token');
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString('access_token', token);
    } else {
      await prefs.remove('access_token');
    }
  }

  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  Map<String, String> _buildHeaders({bool isMultipart = false}) {
    final headers = <String, String>{};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final response = await http.get(url, headers: _buildHeaders());
    return _handleResponse(response);
  }

  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final response = await http.post(
      url,
      headers: _buildHeaders(),
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<dynamic> put(String endpoint, {Map<String, dynamic>? body}) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final response = await http.put(
      url,
      headers: _buildHeaders(),
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  /// Upload using raw bytes — works on Web AND native platforms.
  Future<dynamic> uploadBytes(
    String endpoint,
    Uint8List bytes,
    String fileName, {
    Map<String, String>? fields,
  }) async {
    final url = Uri.parse('$_baseUrl$endpoint');
    final request = http.MultipartRequest('POST', url);
    request.headers.addAll(_buildHeaders(isMultipart: true));

    if (fields != null) {
      request.fields.addAll(fields);
    }

    request.files.add(
      http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: fileName,
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = response.body;
    }

    if (statusCode >= 200 && statusCode < 300) {
      return body;
    } else {
      String errorMsg = 'An unexpected server error occurred ($statusCode)';
      if (body is Map && body.containsKey('detail')) {
        errorMsg = body['detail'].toString();
      }
      throw ApiException(statusCode, errorMsg);
    }
  }
}
