import 'package:flutter/foundation.dart';
import '../models/auth_response.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService;
  
  bool _isLoading = false;
  String? _errorMessage;
  AuthResponse? _authResponse;

  AuthProvider(this._authService);

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _authService.isLoggedIn();
  AuthResponse? get authResponse => _authResponse;
  
  String? get userName => _authService.getCurrentUserName();
  String? get userEmail => _authService.getCurrentUserEmail();
  String? get userRole => _authService.getCurrentUserRole();

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _authResponse = await _authService.login(email, password);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _authResponse = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
