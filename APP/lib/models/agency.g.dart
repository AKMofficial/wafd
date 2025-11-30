// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'agency.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Agency _$AgencyFromJson(Map<String, dynamic> json) => Agency(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  code: json['code'] as String?,
  country: json['country'] as String,
  status: $enumDecode(_$AgencyStatusEnumMap, json['status']),
  maxPilgrim: (json['maxPilgrim'] as num).toInt(),
  pilgrimsCount: (json['pilgrimsCount'] as num).toInt(),
  notes: json['notes'] as String?,
  managerId: (json['managerId'] as num?)?.toInt(),
  managerName: json['managerName'] as String?,
  managerEmail: json['managerEmail'] as String?,
  managerPhone: json['managerPhone'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$AgencyToJson(Agency instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'code': instance.code,
  'country': instance.country,
  'status': _$AgencyStatusEnumMap[instance.status]!,
  'maxPilgrim': instance.maxPilgrim,
  'pilgrimsCount': instance.pilgrimsCount,
  'notes': instance.notes,
  'managerId': instance.managerId,
  'managerName': instance.managerName,
  'managerEmail': instance.managerEmail,
  'managerPhone': instance.managerPhone,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$AgencyStatusEnumMap = {
  AgencyStatus.Registered: 'Registered',
  AgencyStatus.Arrived: 'Arrived',
  AgencyStatus.Departed: 'Departed',
  AgencyStatus.Cancelled: 'Cancelled',
};
