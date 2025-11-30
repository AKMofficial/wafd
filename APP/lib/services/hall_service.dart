import '../models/hall.dart';
import '../utils/api_constants.dart';
import 'api_service.dart';

class HallService {
  final ApiService _apiService;

  HallService(this._apiService);

  Future<List<Hall>> getAllHalls() async {
    final response = await _apiService.get(ApiConstants.tents);
    final List<dynamic> hallsList = response as List<dynamic>;
    return hallsList.map((json) => Hall.fromJson(json)).toList();
  }

  Future<Hall> getHallById(String id) async {
    final response = await _apiService.get('${ApiConstants.getTent}/$id');
    return Hall.fromJson(response);
  }

  Future<void> addHall(Map<String, dynamic> hallData) async {
    await _apiService.post(
      ApiConstants.addTent,
      body: hallData,
    );
  }

  Future<void> updateHall(String id, Map<String, dynamic> hallData) async {
    await _apiService.put(
      '${ApiConstants.updateTent}/$id',
      body: hallData,
    );
  }

  Future<void> deleteHall(String id) async {
    await _apiService.delete('${ApiConstants.deleteTent}/$id');
  }
}
