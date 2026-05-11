# Fire Fighter Robot Controller (Agent module)

This repository provides a minimal mobile-control implementation focused on `src/Agent`.

## What is implemented

- Robot connection manager with:
  - Wi‑Fi transport (WebSocket)
  - Bluetooth transport abstraction (inject BLE/Classic connector)
  - Connection status updates (`disconnected`, `connecting`, `connected`, `reconnecting`, `error`)
  - Auto-reconnect with exponential backoff and max retry
- Movement command dispatcher:
  - `FORWARD`, `BACKWARD`, `LEFT`, `RIGHT`, `STOP`
  - Command protocol: text commands `F`, `B`, `L`, `R`, `S`
  - Throttling to avoid command flooding
  - `STOP` bypasses throttling (highest priority)
- Minimal local authentication service
- React Native-ready UI components under `src/Agent/ui`:
  - `LoginScreen`
  - `ControllerScreen`
  - `AgentApp` (login gating + controller wiring)

## Project structure

- `/home/runner/work/fire-fighter/fire-fighter/src/Agent/config.js`
- `/home/runner/work/fire-fighter/fire-fighter/src/Agent/RobotConnectionManager.js`
- `/home/runner/work/fire-fighter/fire-fighter/src/Agent/RobotCommandDispatcher.js`
- `/home/runner/work/fire-fighter/fire-fighter/src/Agent/LocalAuthService.js`
- `/home/runner/work/fire-fighter/fire-fighter/src/Agent/transports/*`
- `/home/runner/work/fire-fighter/fire-fighter/src/Agent/ui/*`
- `/home/runner/work/fire-fighter/fire-fighter/test/Agent/RobotConnectionManager.test.js`

## Configure connection defaults

Update `DEFAULT_AGENT_CONFIG` in `src/Agent/config.js`:

- Wi‑Fi endpoint: `connection.wifiUrl`
- Bluetooth target: `connection.bluetoothDeviceId`
- Reconnect strategy:
  - `maxReconnectAttempts`
  - `reconnectBaseDelayMs`
  - `reconnectMaxDelayMs`

You can also pass runtime overrides:

```js
new RobotConnectionManager({
  config: {
    connection: {
      wifiUrl: 'ws://10.0.0.45:8080',
    },
  },
});
```

## Bluetooth integration

`BluetoothTransport` expects an injected connector:

```js
const manager = new RobotConnectionManager();
manager.connect({
  type: 'bluetooth',
  bluetoothConnector: {
    async connect({ deviceId, onClose, onMessage }) {
      // return { send(), disconnect() }
    },
  },
});
```

## Run tests

```bash
cd /home/runner/work/fire-fighter/fire-fighter
node --test test/Agent/*.test.js
```

## Use in a React Native app

```js
const { AgentApp } = require('./src/Agent');
```

Render `AgentApp` as your app root (or compose into your existing navigation).

## UI preview

A controller/login mock preview image is included at:

- `/home/runner/work/fire-fighter/fire-fighter/docs/agent-ui-preview.png`
