// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'hall.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Hall _$HallFromJson(Map<String, dynamic> json) => Hall(
  id: json['id'] as String,
  name: json['name'] as String,
  code: json['code'] as String,
  type: $enumDecode(_$HallTypeEnumMap, json['type']),
  capacity: (json['capacity'] as num).toInt(),
  currentOccupancy: (json['currentOccupancy'] as num).toInt(),
  availableBeds: (json['availableBeds'] as num).toInt(),
  specialNeedsOccupancy: (json['specialNeedsOccupancy'] as num).toInt(),
  beds: (json['beds'] as List<dynamic>)
      .map((e) => Bed.fromJson(e as Map<String, dynamic>))
      .toList(),
  numberingFormat: $enumDecode(
    _$BedNumberingFormatEnumMap,
    json['numberingFormat'],
  ),
  numberingConfig: json['numberingConfig'] == null
      ? null
      : BedNumberingConfig.fromJson(
          json['numberingConfig'] as Map<String, dynamic>,
        ),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$HallToJson(Hall instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'code': instance.code,
  'type': _$HallTypeEnumMap[instance.type]!,
  'capacity': instance.capacity,
  'currentOccupancy': instance.currentOccupancy,
  'availableBeds': instance.availableBeds,
  'specialNeedsOccupancy': instance.specialNeedsOccupancy,
  'beds': instance.beds,
  'numberingFormat': _$BedNumberingFormatEnumMap[instance.numberingFormat]!,
  'numberingConfig': instance.numberingConfig,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$HallTypeEnumMap = {HallType.male: 'male', HallType.female: 'female'};

const _$BedNumberingFormatEnumMap = {
  BedNumberingFormat.standard: 'standard',
  BedNumberingFormat.custom: 'custom',
};

Bed _$BedFromJson(Map<String, dynamic> json) => Bed(
  id: json['id'] as String,
  number: json['number'] as String,
  hallId: json['hallId'] as String,
  hallCode: json['hallCode'] as String,
  status: $enumDecode(_$BedStatusEnumMap, json['status']),
  pilgrimId: json['pilgrimId'] as String?,
  isSpecialNeeds: json['isSpecialNeeds'] as bool,
  isDoubleBed: json['isDoubleBed'] as bool?,
  companionBedId: json['companionBedId'] as String?,
  lastAssignedAt: json['lastAssignedAt'] == null
      ? null
      : DateTime.parse(json['lastAssignedAt'] as String),
  lastVacatedAt: json['lastVacatedAt'] == null
      ? null
      : DateTime.parse(json['lastVacatedAt'] as String),
  maintenanceNotes: json['maintenanceNotes'] as String?,
);

Map<String, dynamic> _$BedToJson(Bed instance) => <String, dynamic>{
  'id': instance.id,
  'number': instance.number,
  'hallId': instance.hallId,
  'hallCode': instance.hallCode,
  'status': _$BedStatusEnumMap[instance.status]!,
  'pilgrimId': instance.pilgrimId,
  'isSpecialNeeds': instance.isSpecialNeeds,
  'isDoubleBed': instance.isDoubleBed,
  'companionBedId': instance.companionBedId,
  'lastAssignedAt': instance.lastAssignedAt?.toIso8601String(),
  'lastVacatedAt': instance.lastVacatedAt?.toIso8601String(),
  'maintenanceNotes': instance.maintenanceNotes,
};

const _$BedStatusEnumMap = {
  BedStatus.vacant: 'vacant',
  BedStatus.occupied: 'occupied',
  BedStatus.reserved: 'reserved',
  BedStatus.maintenance: 'maintenance',
};

BedNumberingConfig _$BedNumberingConfigFromJson(Map<String, dynamic> json) =>
    BedNumberingConfig(
      prefix: json['prefix'] as String?,
      suffix: json['suffix'] as String?,
      startNumber: (json['startNumber'] as num).toInt(),
      padding: (json['padding'] as num).toInt(),
      separator: json['separator'] as String,
    );

Map<String, dynamic> _$BedNumberingConfigToJson(BedNumberingConfig instance) =>
    <String, dynamic>{
      'prefix': instance.prefix,
      'suffix': instance.suffix,
      'startNumber': instance.startNumber,
      'padding': instance.padding,
      'separator': instance.separator,
    };
