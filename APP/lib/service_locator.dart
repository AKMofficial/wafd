import 'package:http/http.dart' as http;
import 'services/storage_service.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/pilgrim_service.dart';
import 'services/hall_service.dart';
import 'services/agency_service.dart';

class ServiceLocator {
  static late StorageService _storageService;
  static late ApiService _apiService;
  static late AuthService _authService;
  static late PilgrimService _pilgrimService;
  static late HallService _hallService;
  static late AgencyService _agencyService;

  static Future<void> init() async {
    _storageService = await StorageService.init();
    _apiService = ApiService(_storageService, http.Client());
    _authService = AuthService(_apiService, _storageService);
    _pilgrimService = PilgrimService(_apiService);
    _hallService = HallService(_apiService);
    _agencyService = AgencyService(_apiService);
  }

  static StorageService get storage => _storageService;
  static ApiService get api => _apiService;
  static AuthService get auth => _authService;
  static PilgrimService get pilgrim => _pilgrimService;
  static HallService get hall => _hallService;
  static AgencyService get agency => _agencyService;
}
