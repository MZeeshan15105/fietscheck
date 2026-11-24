import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'theme.dart';

void main() => runApp(const FietsCheckApp());

class FietsCheckApp extends StatefulWidget {
  const FietsCheckApp({super.key});
  @override
  State<FietsCheckApp> createState() => _FietsCheckAppState();
}

class _FietsCheckAppState extends State<FietsCheckApp> {
  ThemeMode mode = ThemeMode.dark;

  void toggleTheme() => setState(
      () => mode = mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FietsCheck',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(Brightness.light),
      darkTheme: buildTheme(Brightness.dark),
      themeMode: mode,
      themeAnimationDuration: const Duration(milliseconds: 450),
      home: Shell(onToggleTheme: toggleTheme, isDark: mode == ThemeMode.dark),
    );
  }
}

class Shell extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;
  const Shell({super.key, required this.onToggleTheme, required this.isDark});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int tab = 0;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final pages = [
      HomePage(onToggleTheme: widget.onToggleTheme, isDark: widget.isDark),
      const ComingSoon(title: 'Garage', icon: Icons.home_outlined),
      const ComingSoon(title: 'Shops', icon: Icons.place_outlined),
      const ComingSoon(title: 'Prices', icon: Icons.sort_rounded),
    ];
    return Scaffold(
      extendBody: true,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 280),
        switchInCurve: Curves.easeOutCubic,
        transitionBuilder: (child, a) => FadeTransition(
          opacity: a,
          child: SlideTransition(
              position: Tween(begin: const Offset(0, .03), end: Offset.zero).animate(a),
              child: child),
        ),
        child: KeyedSubtree(key: ValueKey(tab), child: pages[tab]),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        child: Container(
          height: 68,
          decoration: BoxDecoration(
            color: p.surface.withOpacity(.94),
            borderRadius: BorderRadius.circular(26),
            border: Border.all(color: p.line),
            boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 24, offset: Offset(0, 8))],
          ),
          child: Row(children: [
            for (final (i, item) in const [
              ('Check', Icons.pedal_bike_rounded),
              ('Garage', Icons.home_outlined),
              ('Shops', Icons.place_outlined),
              ('Prices', Icons.sort_rounded),
            ].indexed)
              Expanded(
                child: _NavItem(
                  label: item.$1,
                  icon: item.$2,
                  active: tab == i,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    setState(() => tab = i);
                  },
                ),
              ),
          ]),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;
  const _NavItem({required this.label, required this.icon, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOutBack,
          padding: EdgeInsets.symmetric(horizontal: active ? 18 : 8, vertical: 4),
          decoration: BoxDecoration(
            color: active ? FC.signal : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, size: 22, color: active ? FC.onSignal : p.mute),
        ),
        const SizedBox(height: 4),
        Text(label,
            style: TextStyle(
                fontSize: 12,
                fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                color: active ? p.ink : p.mute)),
      ]),
    );
  }
}

class HomePage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;
  const HomePage({super.key, required this.onToggleTheme, required this.isDark});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with SingleTickerProviderStateMixin {
  bool ebike = true;
  late final AnimationController intro =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();

  @override
  void dispose() {
    intro.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
        children: [
          // Header: wordmark + theme toggle
          Row(children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: FC.asphalt, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.pedal_bike_rounded, color: FC.signal, size: 24),
            ),
            const SizedBox(width: 10),
            Text.rich(TextSpan(children: [
              TextSpan(text: 'Fiets', style: head(26, p.ink)),
              TextSpan(text: 'Check', style: head(26, FC.signal)),
            ])),
            const Spacer(),
            _RoundButton(
              icon: widget.isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
              onTap: () {
                HapticFeedback.lightImpact();
                widget.onToggleTheme();
              },
            ),
          ]),
          const SizedBox(height: 16),

          // Hero card
          Container(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            decoration: BoxDecoration(
              color: p.glass,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: p.line),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text.rich(TextSpan(children: [
                TextSpan(text: 'What is wrong\nwith your ', style: head(34, p.ink)),
                TextSpan(text: 'bike', style: head(34, FC.signal)),
                TextSpan(text: '?', style: head(34, p.ink)),
              ])),
              const SizedBox(height: 12),
              Text(
                'Tap the part that has a problem. We tell you what it probably is, '
                'if it is safe, what it costs and what to say to the mechanic.',
                style: TextStyle(fontSize: 15, height: 1.45, color: p.mute),
              ),
              const SizedBox(height: 16),
              // Bike drives in from the left on open, then swaps on toggle
              SlideTransition(
                position: Tween(begin: const Offset(-.6, 0), end: Offset.zero)
                    .animate(CurvedAnimation(parent: intro, curve: Curves.easeOutCubic)),
                child: FadeTransition(
                  opacity: intro,
                  child: AspectRatio(
                    aspectRatio: 1100 / 695,
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 350),
                      child: Image.asset(
                        ebike ? 'assets/img/bike-ebike.webp' : 'assets/img/bike-city.webp',
                        key: ValueKey(ebike),
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(children: [
                Text('Bike', style: TextStyle(color: p.mute, fontSize: 14)),
                const SizedBox(width: 10),
                _Segmented(
                  options: const ['City bike', 'E-bike'],
                  selected: ebike ? 1 : 0,
                  onChanged: (i) {
                    HapticFeedback.selectionClick();
                    setState(() => ebike = i == 1);
                  },
                ),
              ]),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: FC.signal,
                    foregroundColor: FC.onSignal,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    textStyle: head(17, FC.onSignal, weight: FontWeight.w700),
                  ),
                  onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Part picker comes in the next build')),
                  ),
                  child: const Text('Pick a part'),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 14),

          // Tools grid (same four as the web app)
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.25,
            children: const [
              _ToolCard(icon: Icons.pedal_bike_rounded, title: 'Find a bike', sub: '100 bikes, €50 to cargo'),
              _ToolCard(icon: Icons.verified_user_outlined, title: 'Warranty help', sub: 'Is the repair free?'),
              _ToolCard(icon: Icons.checklist_rounded, title: 'Pre-ride check', sub: '7 things, 60 seconds'),
              _ToolCard(icon: Icons.auto_awesome_outlined, title: 'Try an example', sub: 'See a sample result'),
            ],
          ),
        ],
      ),
    );
  }
}

class _RoundButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _RoundButton({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Material(
      color: p.surface2,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(width: 46, height: 46, child: Icon(icon, color: p.ink, size: 22)),
      ),
    );
  }
}

class _Segmented extends StatelessWidget {
  final List<String> options;
  final int selected;
  final ValueChanged<int> onChanged;
  const _Segmented({required this.options, required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: p.line),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        for (var i = 0; i < options.length; i++)
          GestureDetector(
            onTap: () => onChanged(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOut,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
              decoration: BoxDecoration(
                color: i == selected ? FC.signal : Colors.transparent,
                borderRadius: BorderRadius.circular(26),
              ),
              child: Text(options[i],
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: i == selected ? FC.onSignal : p.ink)),
            ),
          ),
      ]),
    );
  }
}

class _ToolCard extends StatelessWidget {
  final IconData icon;
  final String title, sub;
  const _ToolCard({required this.icon, required this.title, required this.sub});

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Material(
      color: p.glass,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22), side: BorderSide(color: p.line)),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: () => HapticFeedback.lightImpact(),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: p.surface2, borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: FC.signal, size: 22),
            ),
            const Spacer(),
            Text(title, style: head(17, p.ink, weight: FontWeight.w700)),
            const SizedBox(height: 3),
            Text(sub, style: TextStyle(fontSize: 13, color: p.mute), maxLines: 1, overflow: TextOverflow.ellipsis),
          ]),
        ),
      ),
    );
  }
}

class ComingSoon extends StatelessWidget {
  final String title;
  final IconData icon;
  const ComingSoon({super.key, required this.title, required this.icon});
  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 48, color: FC.signal),
        const SizedBox(height: 12),
        Text(title, style: head(28, p.ink)),
        const SizedBox(height: 6),
        Text('Coming in the Flutter version', style: TextStyle(color: p.mute)),
      ]),
    );
  }
}
