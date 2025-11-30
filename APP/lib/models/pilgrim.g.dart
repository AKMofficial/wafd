// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pilgrim.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Pilgrim _$PilgrimFromJson(Map<String, dynamic> json) => Pilgrim(
  id: (json['id'] as num).toInt(),
  registrationNumber: json['registrationNumber'] as String?,
  nationalId: json['nationalId'] as String?,
  passportNumber: json['passportNumber'] as String?,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  fullName: json['fullName'] as String?,
  birthDate: json['birthDate'] == null
      ? null
      : DateTime.parse(json['birthDate'] as String),
  age: (json['age'] as num?)?.toInt(),
  gender: $enumDecodeNullable(_$GenderEnumMap, json['gender']),
  nationality: json['nationality'] as String?,
  phoneNumber: json['phoneNumber'] as String?,
  emergencyContact: json['emergencyContact'] as String?,
  emergencyPhone: json['emergencyPhone'] as String?,
  hasSpecialNeeds: json['hasSpecialNeeds'] as bool,
  specialNeedsType: $enumDecodeNullable(
    _$SpecialNeedsTypeEnumMap,
    json['specialNeedsType'],
  ),
  specialNeedsNotes: json['specialNeedsNotes'] as String?,
  status: $enumDecodeNullable(_$PilgrimStatusEnumMap, json['status']),
  arrivalDate: json['arrivalDate'] == null
      ? null
      : DateTime.parse(json['arrivalDate'] as String),
  departureDate: json['departureDate'] == null
      ? null
      : DateTime.parse(json['departureDate'] as String),
  assignedBed: json['assignedBed'] as String?,
  assignedHall: json['assignedHall'] as String?,
  groupId: (json['groupId'] as num?)?.toInt(),
  groupName: json['groupName'] as String?,
  notes: json['notes'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$PilgrimToJson(Pilgrim instance) => <String, dynamic>{
  'id': instance.id,
  'registrationNumber': instance.registrationNumber,
  'nationalId': instance.nationalId,
  'passportNumber': instance.passportNumber,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'fullName': instance.fullName,
  'birthDate': instance.birthDate?.toIso8601String(),
  'age': instance.age,
  'gender': _$GenderEnumMap[instance.gender],
  'nationality': instance.nationality,
  'phoneNumber': instance.phoneNumber,
  'emergencyContact': instance.emergencyContact,
  'emergencyPhone': instance.emergencyPhone,
  'hasSpecialNeeds': instance.hasSpecialNeeds,
  'specialNeedsType': _$SpecialNeedsTypeEnumMap[instance.specialNeedsType],
  'specialNeedsNotes': instance.specialNeedsNotes,
  'status': _$PilgrimStatusEnumMap[instance.status],
  'arrivalDate': instance.arrivalDate?.toIso8601String(),
  'departureDate': instance.departureDate?.toIso8601String(),
  'assignedBed': instance.assignedBed,
  'assignedHall': instance.assignedHall,
  'groupId': instance.groupId,
  'groupName': instance.groupName,
  'notes': instance.notes,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
};

const _$GenderEnumMap = {Gender.male: 'male', Gender.female: 'female'};

const _$SpecialNeedsTypeEnumMap = {
  SpecialNeedsType.mobility: 'mobility',
  SpecialNeedsType.vision_hearing: 'vision_hearing',
  SpecialNeedsType.medical_care: 'medical_care',
  SpecialNeedsType.elderly_cognitive: 'elderly_cognitive',
  SpecialNeedsType.dietary_language: 'dietary_language',
  SpecialNeedsType.other: 'other',
};

const _$PilgrimStatusEnumMap = {
  PilgrimStatus.expected: 'expected',
  PilgrimStatus.arrived: 'arrived',
  PilgrimStatus.departed: 'departed',
  PilgrimStatus.no_show: 'no_show',
};
