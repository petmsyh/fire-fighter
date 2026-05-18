import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class DiscoverScreen extends StatefulWidget {
  final BluetoothDevice device;

  const DiscoverScreen({super.key, required this.device});

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  List<BluetoothService> _services = const [];
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final s = await widget.device.discoverServices();
      setState(() => _services = s);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  String _props(BluetoothCharacteristic c) {
    final p = c.properties;
    final flags = <String>[];
    if (p.read) flags.add('read');
    if (p.write) flags.add('write');
    if (p.writeWithoutResponse) flags.add('writeNoRsp');
    if (p.notify) flags.add('notify');
    if (p.indicate) flags.add('indicate');
    return flags.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Discover (UUIDs)'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                if (_error != null)
                  MaterialBanner(
                    content: Text(_error!),
                    actions: [
                      TextButton(onPressed: () => setState(() => _error = null), child: const Text('Dismiss')),
                    ],
                  ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _services.length,
                    itemBuilder: (context, i) {
                      final s = _services[i];
                      return ExpansionTile(
                        title: Text('Service: ${s.uuid}'),
                        children: [
                          for (final c in s.characteristics)
                            ListTile(
                              title: Text('Char: ${c.uuid}'),
                              subtitle: Text(_props(c)),
                              onTap: () async {
                                await showDialog<void>(
                                  context: context,
                                  builder: (ctx) => AlertDialog(
                                    title: const Text('Copy these UUIDs'),
                                    content: SelectableText(
                                      'Service UUID: ${s.uuid}\nCharacteristic UUID: ${c.uuid}\nProperties: ${_props(c)}',
                                    ),
                                    actions: [
                                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
                                    ],
                                  ),
                                );
                              },
                            ),
                        ],
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
