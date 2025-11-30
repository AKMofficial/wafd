import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_constants.dart';
import '../models/auth_response.dart';
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class ApiService {
  final StorageService _storage;
  final http.Client _client;

  ApiService(this._storage, [http.Client? client]) : _client = client ?? http.Client();

  Map<String, String> _getHeaders({bool includeAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      final token = _storage.getAccessToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<dynamic> _handleResponse(http.Response response) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      try {
        return json.decode(response.body);
      } catch (e) {
        return response.body;
      }
    }

    String errorMessage = 'API Error: ${response.statusCode}';
    
    // Special handling for 403 Forbidden
    if (response.statusCode == 403) {
      errorMessage = 'Access Denied: You do not have permission to access this resource';
    }
    
    try {
      final error = json.decode(response.body);
      errorMessage = error['message'] ?? errorMessage;
    } catch (e) {
      // Use default error message
    }

    throw ApiException(errorMessage, response.statusCode);
  }

  Future<dynamic> get(String endpoint, {Map<String, String>? queryParams}) async {
    var uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      uri = uri.replace(queryParameters: queryParams);
    }

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      
      // Handle 401 and try to refresh token
      if (response.statusCode == 401) {
        await _refreshToken();
        final retryResponse = await _client.get(uri, headers: _getHeaders());
        return await _handleResponse(retryResponse);
      }
      
      return await _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body, bool includeAuth = true}) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(includeAuth: includeAuth),
        body: body != null ? json.encode(body) : null,
      );

      // Handle 401 and try to refresh token (skip for login endpoint)
      if (response.statusCode == 401 && includeAuth && endpoint != ApiConstants.login) {
        await _refreshToken();
        final retryResponse = await _client.post(
          uri,
          headers: _getHeaders(),
          body: body != null ? json.encode(body) : null,
        );
        return await _handleResponse(retryResponse);
      }

      return await _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  Future<dynamic> put(String endpoint, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body != null ? json.encode(body) : null,
      );

      // Handle 401 and try to refresh token
      if (response.statusCode == 401) {
        await _refreshToken();
        final retryResponse = await _client.put(
          uri,
          headers: _getHeaders(),
          body: body != null ? json.encode(body) : null,
        );
        return await _handleResponse(retryResponse);
      }

      return await _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  Future<dynamic> delete(String endpoint) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());

      // Handle 401 and try to refresh token
      if (response.statusCode == 401) {
        await _refreshToken();
        final retryResponse = await _client.delete(uri, headers: _getHeaders());
        return await _handleResponse(retryResponse);
      }

      return await _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  Future<void> _refreshToken() async {
    final refreshToken = _storage.getRefreshToken();
    if (refreshToken == null) {
      throw ApiException('No refresh token available');
    }

    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.refresh}');
    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'refreshToken': refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final authResponse = AuthResponse.fromJson(data);
      await _storage.saveAccessToken(authResponse.accessToken);
      await _storage.saveRefreshToken(authResponse.refreshToken);
    } else {
      // Refresh failed, clear storage
      await _storage.clearAll();
      throw ApiException('Session expired. Please login again.');
    }
  }

  void dispose() {
    _client.close();
  }
}
