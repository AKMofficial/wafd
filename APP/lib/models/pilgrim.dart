import 'package:json_annotation/json_annotation.dart';

part 'pilgrim.g.dart';

enum Gender { male, female }
enum SpecialNeedsType { mobility, vision_hearing, medical_care, elderly_cognitive, dietary_language, other }
enum PilgrimStatus { expected, arrived, departed, no_show }

@JsonSerializable()
class Pilgrim {
  final int id;
  final String? registrationNumber;
  final String? nationalId;
  final String? passportNumber;
  final String? firstName;
  final String? lastName;
  final String? fullName;
  final DateTime? birthDate;
  final int? age;
  final Gender? gender;
  final String? nationality;
  final String? phoneNumber;
  final String? emergencyContact;
  final String? emergencyPhone;
  final bool hasSpecialNeeds;
  final SpecialNeedsType? specialNeedsType;
  final String? specialNeedsNotes;
  final PilgrimStatus? status;
  final DateTime? arrivalDate;
  final DateTime? departureDate;
  final String? assignedBed;
  final String? assignedHall;
  final int? groupId;
  final String? groupName;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Pilgrim({
    required this.id,
    this.registrationNumber,
    this.nationalId,
    this.passportNumber,
    this.firstName,
    this.lastName,
    this.fullName,
    this.birthDate,
    this.age,
    this.gender,
    this.nationality,
    this.phoneNumber,
    this.emergencyContact,
    this.emergencyPhone,
    required this.hasSpecialNeeds,
    this.specialNeedsType,
    this.specialNeedsNotes,
    this.status,
    this.arrivalDate,
    this.departureDate,
    this.assignedBed,
    this.assignedHall,
    this.groupId,
    this.groupName,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory Pilgrim.fromJson(Map<String, dynamic> json) => _$PilgrimFromJson(json);
  Map<String, dynamic> toJson() => _$PilgrimToJson(this);
}
