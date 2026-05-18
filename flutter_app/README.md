# Flutter mobile app (Bluetooth-only)

This folder contains a Flutter mobile app that can connect to the Fire Fighter robot over **BLE** and send movement commands.

## What’s included
- BLE scan + connect UI
- Simple controller UI that sends: `F`, `B`, `L`, `R`, `S`
- A **Service/Characteristic discovery** screen to help you find the correct write characteristic

## Setup
1. Install Flutter.
2. From this folder:
   ```bash
   flutter pub get
   flutter run
   ```

## BLE notes
To send commands, you must choose a **write** characteristic (Write or WriteWithoutResponse).

If you don't know the UUIDs:
- Connect to the device
- Open **Discover** screen
- Copy the Service UUID and Characteristic UUID that supports writing
- Then we can lock the app to those UUIDs.
