import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _accessTokenKey = 'accessToken';
  static const String _refreshTokenKey = 'refreshToken';
  static const String _userIdKey = 'userId';
  static const String _userNameKey = 'userName';
  static const String _userEmailKey = 'userEmail';
  static const String _userRoleKey = 'userRole';

  final SharedPreferences _prefs;

  StorageService(this._prefs);

  static Future<StorageService> init() async {
    final prefs = await SharedPreferences.getInstance();
    return StorageService(prefs);
  }

  // Access Token
  Future<void> saveAccessToken(String token) async {
    await _prefs.setString(_accessTokenKey, token);
  }

  String? getAccessToken() {
    return _prefs.getString(_accessTokenKey);
  }

  // Refresh Token
  Future<void> saveRefreshToken(String token) async {
    await _prefs.setString(_refreshTokenKey, token);
  }

  String? getRefreshToken() {
    return _prefs.getString(_refreshTokenKey);
  }

  // User Info
  Future<void> saveUserInfo({
    required int userId,
    required String userName,
    required String userEmail,
    required String userRole,
  }) async {
    await _prefs.setInt(_userIdKey, userId);
    await _prefs.setString(_userNameKey, userName);
    await _prefs.setString(_userEmailKey, userEmail);
    await _prefs.setString(_userRoleKey, userRole);
  }

  int? getUserId() => _prefs.getInt(_userIdKey);
  String? getUserName() => _prefs.getString(_userNameKey);
  String? getUserEmail() => _prefs.getString(_userEmailKey);
  String? getUserRole() => _prefs.getString(_userRoleKey);

  // Clear all data
  Future<void> clearAll() async {
    await _prefs.clear();
  }

  // Check if user is logged in
  bool isLoggedIn() {
    return getAccessToken() != null && getRefreshToken() != null;
  }
}
