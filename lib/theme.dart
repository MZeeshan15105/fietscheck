import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Colour tokens copied 1:1 from the web app (index.html :root and dark mode).
class FC {
  static const signal = Color(0xFFFF6B2C);
  static const onSignal = Color(0xFF11161C);
  static const asphalt = Color(0xFF11161C);
  static const onAsphalt = Color(0xFFF2F5F8);
}

class Palette {
  final Color paper, surface, surface2, ink, mute, line, glass;
  const Palette({
    required this.paper,
    required this.surface,
    required this.surface2,
    required this.ink,
    required this.mute,
    required this.line,
    required this.glass,
  });

  static const light = Palette(
    paper: Color(0xFFEFF2F5),
    surface: Color(0xFFFFFFFF),
    surface2: Color(0xFFE7ECF1),
    ink: Color(0xFF12171D),
    mute: Color(0xFF566170),
    line: Color(0xFFDCE2E8),
    glass: Color(0xCCFFFFFF),
  );

  static const dark = Palette(
    paper: Color(0xFF0B0F13),
    surface: Color(0xFF151B22),
    surface2: Color(0xFF1D262F),
    ink: Color(0xFFEEF2F6),
    mute: Color(0xFF9AA7B6),
    line: Color(0xFF26303B),
    glass: Color(0x8C151B22),
  );

  static Palette of(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? dark : light;
}

/// Headings use Archivo (same as the web app); body uses the platform font.
TextStyle head(double size, Color color, {FontWeight weight = FontWeight.w800}) =>
    GoogleFonts.archivo(
        fontSize: size, fontWeight: weight, color: color, height: 1.05, letterSpacing: -0.5);

ThemeData buildTheme(Brightness b) {
  final p = b == Brightness.dark ? Palette.dark : Palette.light;
  return ThemeData(
    useMaterial3: true,
    brightness: b,
    scaffoldBackgroundColor: p.paper,
    colorScheme: ColorScheme.fromSeed(
      seedColor: FC.signal,
      brightness: b,
      primary: FC.signal,
      onPrimary: FC.onSignal,
      surface: p.surface,
    ),
    splashFactory: InkSparkle.splashFactory,
  );
}
