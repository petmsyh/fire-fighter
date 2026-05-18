import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

import 'device_screen.dart';

class DeviceScanScreen extends StatefulWidget {
  const DeviceScanScreen({super.key});

  @override
  State<DeviceScanScreen> createState() => _DeviceScanScreenState();
}

class _DeviceScanScreenState extends State<DeviceScanScreen> {
  StreamSubscription<List<ScanResult>>? _resultsSub;
  StreamSubscription<bool>? _isScanningSub;

  final List<ScanResult> _results = [];
  bool _isScanning = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _listen();
    _startScan();
  }

  void _listen() {
    _resultsSub = FlutterBluePlus.scanResults.listen((r) {
      setState(() {
        _results
          ..clear()
          ..addAll(r);
      });
    }, onError: (e) {
      setState(() => _error = e.toString());
    });

    _isScanningSub = FlutterBluePlus.isScanning.listen((v) {
      setState(() => _isScanning = v);
    });
  }

  Future<void> _startScan() async {
    setState(() => _error = null);

    try {
      // Ensure Bluetooth is on (Android/iOS will prompt as needed)
      await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  Future<void> _stopScan() async {
    try {
      await FlutterBluePlus.stopScan();
    } catch (_) {
      // ignore
    }
  }

  @override
  void dispose() {
    _resultsSub?.cancel();
    _isScanningSub?.cancel();
    _stopScan();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan (BLE)'),
        actions: [
          IconButton(
            onPressed: _isScanning ? _stopScan : _startScan,
            icon: Icon(_isScanning ? Icons.stop : Icons.refresh),
            tooltip: _isScanning ? 'Stop' : 'Scan',
          ),
        ],
      ),
      body: Column(
        children: [
          if (_error != null)
            MaterialBanner(
              content: Text(_error!),
              actions: [
                TextButton(onPressed: () => setState(() => _error = null), child: const Text('Dismiss')),
              ],
            ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _isScanning ? 'Scanning…' : 'Scan stopped',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
                FilledButton(
                  onPressed: _isScanning ? null : _startScan,
                  child: const Text('Scan'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              itemCount: _results.length,
              itemBuilder: (context, index) {
                final r = _results[index];
                final device = r.device;
                final name = device.platformName.isNotEmpty ? device.platformName : '(unknown)';

                return ListTile(
                  leading: const Icon(Icons.bluetooth),
                  title: Text(name),
                  subtitle: Text(device.remoteId.str),
                  trailing: Text('${r.rssi} dBm'),
                  onTap: () async {
                    await _stopScan();
                    if (!context.mounted) return;
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => DeviceScreen(device: device)),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
