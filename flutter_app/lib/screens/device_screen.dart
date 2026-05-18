import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

import '../services/ble_robot_service.dart';
import 'discover_screen.dart';

class DeviceScreen extends StatefulWidget {
  final BluetoothDevice device;

  const DeviceScreen({super.key, required this.device});

  @override
  State<DeviceScreen> createState() => _DeviceScreenState();
}

class _DeviceScreenState extends State<DeviceScreen> {
  final BleRobotService _robot = BleRobotService();

  StreamSubscription<BluetoothConnectionState>? _connSub;
  BluetoothConnectionState _state = BluetoothConnectionState.disconnected;
  String? _error;

  @override
  void initState() {
    super.initState();
    _connSub = widget.device.connectionState.listen((s) {
      setState(() => _state = s);
    });

    _connect();
  }

  Future<void> _connect() async {
    setState(() {
      _error = null;
    });

    try {
      await widget.device.connect(timeout: const Duration(seconds: 15), autoConnect: false);
    } catch (e) {
      // it's common to get "already connected" errors
    }

    try {
      await widget.device.discoverServices();
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  Future<void> _disconnect() async {
    try {
      await widget.device.disconnect();
    } catch (_) {
      // ignore
    }
  }

  Future<void> _send(String cmd) async {
    setState(() => _error = null);

    try {
      await _robot.sendCommand(widget.device, cmd);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  void dispose() {
    _connSub?.cancel();
    _disconnect();
    super.dispose();
  }

  bool get _connected => _state == BluetoothConnectionState.connected;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.device.platformName.isNotEmpty ? widget.device.platformName : 'Device'),
        actions: [
          IconButton(
            tooltip: 'Discover services/characteristics',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => DiscoverScreen(device: widget.device)),
              );
            },
            icon: const Icon(Icons.search),
          ),
          IconButton(
            tooltip: 'Disconnect',
            onPressed: _disconnect,
            icon: const Icon(Icons.link_off),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('State: $_state'),
            const SizedBox(height: 8),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            const SizedBox(height: 16),
            Text('Controller', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Expanded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 260),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      FilledButton(
                        onPressed: _connected ? () => _send('F') : null,
                        child: const Text('FORWARD (F)'),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton(
                              onPressed: _connected ? () => _send('L') : null,
                              child: const Text('LEFT (L)'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton(
                              onPressed: _connected ? () => _send('R') : null,
                              child: const Text('RIGHT (R)'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: _connected ? () => _send('B') : null,
                        child: const Text('BACKWARD (B)'),
                      ),
                      const SizedBox(height: 18),
                      OutlinedButton(
                        onPressed: _connected ? () => _send('S') : null,
                        child: const Text('STOP (S)'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
