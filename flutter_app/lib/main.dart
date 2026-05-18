// Flutter entrypoint
import 'package:flutter/material.dart';
import 'package:fire_fighter_mobile/screens/device_scan_screen.dart';

void main() {
  runApp(const FireFighterApp());
}

class FireFighterApp extends StatelessWidget {
  const FireFighterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fire Fighter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true,
      ),
      home: const DeviceScanScreen(),
    );
  }
}
