import '../models/auth_response.dart';
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';
import '../utils/api_constants.dart';

class AuthService {
  final ApiService _apiService;
  final StorageService _storage;

  AuthService(this._apiService, this._storage);

  Future<AuthResponse> login(String email, String password) async {
    final response = await _apiService.post(
      ApiConstants.login,
      body: {
        'email': email,
        'password': password,
      },
      includeAuth: false,
    );

    final authResponse = AuthResponse.fromJson(response);

    // Save tokens and user info
    await _storage.saveAccessToken(authResponse.accessToken);
    await _storage.saveRefreshToken(authResponse.refreshToken);
    await _storage.saveUserInfo(
      userId: authResponse.userId,
      userName: authResponse.userName,
      userEmail: authResponse.userEmail,
      userRole: authResponse.userRole,
    );

    return authResponse;
  }

  Future<void> logout() async {
    try {
      await _apiService.post(ApiConstants.logout);
    } catch (e) {
      // Ignore errors during logout
    } finally {
      await _storage.clearAll();
    }
  }

  Future<User> getCurrentUser() async {
    final response = await _apiService.get(ApiConstants.getCurrentUser);
    return User.fromJson(response);
  }

  bool isLoggedIn() {
    return _storage.isLoggedIn();
  }

  int? getCurrentUserId() => _storage.getUserId();
  String? getCurrentUserName() => _storage.getUserName();
  String? getCurrentUserEmail() => _storage.getUserEmail();
  String? getCurrentUserRole() => _storage.getUserRole();
}
