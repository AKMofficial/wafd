import '../models/pilgrim.dart';
import '../utils/api_constants.dart';
import 'api_service.dart';

class PilgrimService {
  final ApiService _apiService;

  PilgrimService(this._apiService);

  Future<Map<String, dynamic>> getAllPilgrims({
    int page = 0,
    int size = 10,
    String sortBy = 'id',
    String sortDirection = 'DESC',
  }) async {
    final response = await _apiService.get(
      ApiConstants.pilgrims,
      queryParams: {
        'page': page.toString(),
        'size': size.toString(),
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      },
    );
    return response;
  }

  Future<Pilgrim> getPilgrimById(int id) async {
    final response = await _apiService.get('${ApiConstants.getPilgrim}/$id');
    return Pilgrim.fromJson(response);
  }

  Future<Pilgrim> addPilgrim(Map<String, dynamic> pilgrimData) async {
    final response = await _apiService.post(
      ApiConstants.addPilgrim,
      body: pilgrimData,
    );
    return Pilgrim.fromJson(response);
  }

  Future<void> updatePilgrim(int id, Map<String, dynamic> pilgrimData) async {
    await _apiService.put(
      '${ApiConstants.updatePilgrim}/$id',
      body: pilgrimData,
    );
  }

  Future<void> deletePilgrim(int id) async {
    await _apiService.delete('${ApiConstants.deletePilgrim}/$id');
  }

  Future<Map<String, dynamic>> getPilgrimStatistics() async {
    final response = await _apiService.get(ApiConstants.pilgrimStats);
    return response;
  }

  Future<void> assignPilgrimToGroup(int pilgrimId, int groupId) async {
    await _apiService.put(
      '${ApiConstants.assignPilgrimToGroup}/$pilgrimId/group/$groupId',
    );
  }
}
