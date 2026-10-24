import 'package:flutter/material.dart';

class AppTheme {
  // Athletic Performance High-Contrast Palette
  static const Color primaryBlue = Color(0xFF1E3A8A); // Deep Navy
  static const Color accentCyan = Color(0xFF00F2FE);  // High-Tech Neon Cyan
  static const Color electricTeal = Color(0xFF4FACFE); // Electric Blue/Teal
  static const Color accentTeal = Color(0xFF4FACFE);   // Electric Teal alias
  static const Color indigoAccent = Color(0xFF818CF8); // Performance Indigo
  static const Color surfaceDark = Color(0xFF0A0E17); // Obsidian Black
  static const Color cardDark = Color(0xFF131B2E);    // Slate Navy
  static const Color cardDarkElevated = Color(0xFF1A2642); // Elevated Glass Slate
  static const Color borderSubtle = Color(0xFF1E293B); // Subtle border
  static const Color borderGlow = Color(0xFF334155);   // Highlight border
  
  static const Color textLight = Color(0xFFF8FAFC);   // Crisp Ice White
  static const Color textMuted = Color(0xFF94A3B8);   // Muted Slate Gray
  static const Color textDim = Color(0xFF64748B);     // Dim Slate
  
  static const Color successGreen = Color(0xFF10B981); // Emerald Metric Green
  static const Color warningOrange = Color(0xFFF59E0B); // Amber Variation
  static const Color dangerRed = Color(0xFFEF4444);    // Coral Alert Red

  // Signature Gradients
  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF00F2FE), Color(0xFF4FACFE)],
  );

  static const LinearGradient cardGlassGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF131B2E), Color(0xFF1A2642)],
  );

  static const LinearGradient heroTwinGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0E1A33), Color(0xFF14244B), Color(0xFF1A3366)],
  );

  static const LinearGradient geminiAiGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2E1065), Color(0xFF1E1B4B)],
  );

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: surfaceDark,
      colorScheme: const ColorScheme.dark(
        primary: accentCyan,
        onPrimary: surfaceDark,
        secondary: electricTeal,
        surface: cardDark,
        error: dangerRed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceDark,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textLight,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
        iconTheme: IconThemeData(color: textLight),
      ),
      cardTheme: CardThemeData(
        color: cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: borderSubtle, width: 1.2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentCyan,
          foregroundColor: surfaceDark,
          elevation: 4,
          shadowColor: accentCyan.withValues(alpha: 0.35),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: accentCyan,
          side: const BorderSide(color: accentCyan, width: 1.2),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: borderSubtle, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: borderSubtle, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: accentCyan, width: 1.8),
        ),
        labelStyle: const TextStyle(color: textMuted, fontSize: 14),
        hintStyle: const TextStyle(color: textDim, fontSize: 14),
      ),
    );
  }
}
