import 'dart:convert';

import 'package:flutter_blue_plus/flutter_blue_plus.dart';

/// Minimal BLE robot command sender.
///
/// Because we don't yet know your robot's write characteristic UUID,
/// we attempt to find the *first* characteristic that supports
/// write or writeWithoutResponse.
///
/// After you identify the right UUIDs in the Discover screen, we can
/// hardcode them for reliability.
class BleRobotService {
  Future<BluetoothCharacteristic> _findWritableCharacteristic(BluetoothDevice device) async {
    final services = await device.discoverServices();

    for (final s in services) {
      for (final c in s.characteristics) {
        final p = c.properties;
        if (p.write || p.writeWithoutResponse) {
          return c;
        }
      }
    }

    throw StateError('No writable characteristic found. Use Discover to locate one.');
  }

  Future<void> sendCommand(BluetoothDevice device, String cmd) async {
    if (cmd.isEmpty) throw ArgumentError('cmd is empty');

    final c = await _findWritableCharacteristic(device);
    final bytes = utf8.encode(cmd);

    if (c.properties.writeWithoutResponse) {
      await c.write(bytes, withoutResponse: true);
    } else {
      await c.write(bytes, withoutResponse: false);
    }
  }
}
