const DEFAULT_AGENT_CONFIG = {
  connection: {
    defaultType: 'wifi',
    wifiUrl: 'ws://192.168.4.1:8080',
    bluetoothDeviceId: 'FIRE_FIGHTER_ROBOT',
    maxReconnectAttempts: 5,
    reconnectBaseDelayMs: 500,
    reconnectMaxDelayMs: 5000,
  },
  command: {
    protocol: 'text',
    throttleMs: 120,
    map: {
      FORWARD: 'F',
      BACKWARD: 'B',
      LEFT: 'L',
      RIGHT: 'R',
      STOP: 'S',
    },
  },
  auth: {
    username: 'admin',
    password: 'firefighter',
    minUsernameLength: 3,
    minPasswordLength: 4,
  },
};

function mergeConfig(baseConfig, overrideConfig) {
  return {
    ...baseConfig,
    ...overrideConfig,
    connection: {
      ...baseConfig.connection,
      ...(overrideConfig && overrideConfig.connection),
    },
    command: {
      ...baseConfig.command,
      ...(overrideConfig && overrideConfig.command),
      map: {
        ...baseConfig.command.map,
        ...(overrideConfig && overrideConfig.command && overrideConfig.command.map),
      },
    },
    auth: {
      ...baseConfig.auth,
      ...(overrideConfig && overrideConfig.auth),
    },
  };
}

module.exports = {
  DEFAULT_AGENT_CONFIG,
  mergeConfig,
};
