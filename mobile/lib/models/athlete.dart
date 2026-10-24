class Athlete {
  final String id;
  final String userId;
  final String displayName;
  final String sport;
  final String experienceLevel;
  final double? heightCm;
  final double? weightKg;
  final DateTime createdAt;
  final DateTime updatedAt;

  Athlete({
    required this.id,
    required this.userId,
    required this.displayName,
    required this.sport,
    required this.experienceLevel,
    this.heightCm,
    this.weightKg,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Athlete.fromJson(Map<String, dynamic> json) {
    return Athlete(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      displayName: json['display_name'] ?? 'Athlete',
      sport: json['sport'] ?? 'running',
      experienceLevel: json['experience_level'] ?? 'intermediate',
      heightCm: json['height_cm'] != null ? (json['height_cm'] as num).toDouble() : null,
      weightKg: json['weight_kg'] != null ? (json['weight_kg'] as num).toDouble() : null,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'display_name': displayName,
      'sport': sport,
      'experience_level': experienceLevel,
      'height_cm': heightCm,
      'weight_kg': weightKg,
    };
  }
}
