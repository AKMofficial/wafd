import 'package:json_annotation/json_annotation.dart';

part 'agency.g.dart';

enum AgencyStatus { Registered, Arrived, Departed, Cancelled }

@JsonSerializable()
class Agency {
  final int id;
  final String name;
  final String? code;
  final String country;
  final AgencyStatus status;
  final int maxPilgrim;
  final int pilgrimsCount;
  final String? notes;
  final int? managerId;
  final String? managerName;
  final String? managerEmail;
  final String? managerPhone;
  final DateTime createdAt;
  final DateTime updatedAt;

  Agency({
    required this.id,
    required this.name,
    this.code,
    required this.country,
    required this.status,
    required this.maxPilgrim,
    required this.pilgrimsCount,
    this.notes,
    this.managerId,
    this.managerName,
    this.managerEmail,
    this.managerPhone,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Agency.fromJson(Map<String, dynamic> json) => _$AgencyFromJson(json);
  Map<String, dynamic> toJson() => _$AgencyToJson(this);

  int get availableCapacity => maxPilgrim - pilgrimsCount;
  double get utilizationRate => pilgrimsCount / maxPilgrim;
}
