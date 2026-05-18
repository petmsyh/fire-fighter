# Fire Fighter Robot Controller

This repository contains:

- **JavaScript Agent module** under `src/Agent` (connection logic + command dispatcher + RN-ready UI components)
- **Flutter mobile app (BLE only)** under `flutter_app/`

## Flutter app
See `flutter_app/README.md`.

> Note: The Flutter app currently includes a BLE **Discover** screen so you can identify the correct write characteristic UUID. Once you share those UUIDs, we can lock the app to them for reliable command sending.
