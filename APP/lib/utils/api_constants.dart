class ApiConstants {
  // Base URL - configured based on environment
  // For local backend: 'http://localhost:8080/api/v1'
  // For local network (testing on real device): 'http://YOUR_IP:8080/api/v1'
  // For production: 'https://your-backend-url.railway.app/api/v1'
  
  // CHANGE THIS BEFORE BUILDING APK:
  // Development (local network for testing on phone)
  static const String _devBaseUrl = 'http://192.168.100.14:8080/api/v1';
  
  // Production (Railway backend - Railway handles port routing automatically)
  static const String _prodBaseUrl = 'https://wafd-production.up.railway.app/api/v1';
  
  // Toggle this to switch between dev and production
  static const bool _isProduction = true; // Set to true before building release APK
  
  static String get baseUrl => _isProduction ? _prodBaseUrl : _devBaseUrl;
  
  // Auth endpoints
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String getCurrentUser = '/auth/get/me';
  
  // Pilgrim endpoints
  static const String pilgrims = '/pilgrim/get/all';
  static const String addPilgrim = '/pilgrim/add';
  static const String getPilgrim = '/pilgrim/get';
  static const String updatePilgrim = '/pilgrim/update';
  static const String deletePilgrim = '/pilgrim/delete';
  static const String pilgrimStats = '/pilgrim/stats';
  static const String assignPilgrimToGroup = '/pilgrim/assign/pilgrim';
  
  // Tent (Hall) endpoints
  static const String tents = '/tent/get/all';
  static const String addTent = '/tent/add';
  static const String getTent = '/tent/get';
  static const String updateTent = '/tent/update';
  static const String deleteTent = '/tent/delete';
  
  // User endpoints
  static const String users = '/user/get/all';
  static const String addUser = '/user/add';
  static const String updateUser = '/user/update';
  static const String deleteUser = '/user/delete';
  
  // Agency endpoints
  static const String agencies = '/agency/get/all';
  static const String getAgency = '/agency/get';
  static const String addAgency = '/agency/add';
  static const String updateAgency = '/agency/update';
  static const String deleteAgency = '/agency/delete';
  static const String getAgencyPilgrims = '/agency/get'; // /{id}/pilgrims
  
  // Booking endpoints
  static const String bookings = '/booking/get/all';
  static const String addBooking = '/booking/add'; // /{userEmail}
  static const String updateBookedBed = '/booking/update-bed'; // /{bedId}/{userEmail}
  static const String deleteBooking = '/booking/delete';
}
