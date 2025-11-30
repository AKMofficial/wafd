import '../models/agency.dart';
import '../utils/api_constants.dart';
import 'api_service.dart';

class AgencyService {
  final ApiService _apiService;

  AgencyService(this._apiService);

  Future<List<Agency>> getAllAgencies() async {
    final response = await _apiService.get(ApiConstants.agencies);
    final List<dynamic> agenciesList = response as List<dynamic>;
    return agenciesList.map((json) => Agency.fromJson(json)).toList();
  }

  Future<Agency> getAgencyById(int id) async {
    final response = await _apiService.get('${ApiConstants.getAgency}/$id');
    return Agency.fromJson(response);
  }

  Future<List<dynamic>> getAgencyPilgrims(int id) async {
    final response = await _apiService.get('${ApiConstants.getAgency}/$id/pilgrims');
    return response as List<dynamic>;
  }

  Future<Agency> addAgency(Map<String, dynamic> agencyData) async {
    final response = await _apiService.post(
      ApiConstants.addAgency,
      body: agencyData,
    );
    return Agency.fromJson(response);
  }

  Future<Agency> updateAgency(int id, Map<String, dynamic> agencyData) async {
    final response = await _apiService.put(
      '${ApiConstants.updateAgency}/$id',
      body: agencyData,
    );
    return Agency.fromJson(response);
  }

  Future<void> deleteAgency(int id) async {
    await _apiService.delete('${ApiConstants.deleteAgency}/$id');
  }
}
