import 'package:json_annotation/json_annotation.dart';

part 'hall.g.dart';

enum HallType { male, female }
enum BedNumberingFormat { standard, custom }
enum BedStatus { vacant, occupied, reserved, maintenance }

@JsonSerializable()
class Hall {
  final String id;
  final String name;
  final String code;
  final HallType type;
  final int capacity;
  final int currentOccupancy;
  final int availableBeds;
  final int specialNeedsOccupancy;
  final List<Bed> beds;
  final BedNumberingFormat numberingFormat;
  final BedNumberingConfig? numberingConfig;
  final DateTime createdAt;
  final DateTime updatedAt;

  Hall({
    required this.id,
    required this.name,
    required this.code,
    required this.type,
    required this.capacity,
    required this.currentOccupancy,
    required this.availableBeds,
    required this.specialNeedsOccupancy,
    required this.beds,
    required this.numberingFormat,
    this.numberingConfig,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Hall.fromJson(Map<String, dynamic> json) => _$HallFromJson(json);
  Map<String, dynamic> toJson() => _$HallToJson(this);
}

@JsonSerializable()
class Bed {
  final String id;
  final String number;
  final String hallId;
  final String hallCode;
  final BedStatus status;
  final String? pilgrimId;
  final bool isSpecialNeeds;
  final bool? isDoubleBed;
  final String? companionBedId;
  final DateTime? lastAssignedAt;
  final DateTime? lastVacatedAt;
  final String? maintenanceNotes;

  Bed({
    required this.id,
    required this.number,
    required this.hallId,
    required this.hallCode,
    required this.status,
    this.pilgrimId,
    required this.isSpecialNeeds,
    this.isDoubleBed,
    this.companionBedId,
    this.lastAssignedAt,
    this.lastVacatedAt,
    this.maintenanceNotes,
  });

  factory Bed.fromJson(Map<String, dynamic> json) => _$BedFromJson(json);
  Map<String, dynamic> toJson() => _$BedToJson(this);
}

@JsonSerializable()
class BedNumberingConfig {
  final String? prefix;
  final String? suffix;
  final int startNumber;
  final int padding;
  final String separator;

  BedNumberingConfig({
    this.prefix,
    this.suffix,
    required this.startNumber,
    required this.padding,
    required this.separator,
  });

  factory BedNumberingConfig.fromJson(Map<String, dynamic> json) => _$BedNumberingConfigFromJson(json);
  Map<String, dynamic> toJson() => _$BedNumberingConfigToJson(this);
}
