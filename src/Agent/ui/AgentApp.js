const React = require('react');
const { useMemo, useState, useEffect } = React;
const { SafeAreaView } = require('react-native');
const { LoginScreen } = require('./LoginScreen');
const { ControllerScreen } = require('./ControllerScreen');
const { LocalAuthService } = require('../LocalAuthService');
const { RobotConnectionManager } = require('../RobotConnectionManager');
const { RobotCommandDispatcher } = require('../RobotCommandDispatcher');

function AgentApp() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const authService = useMemo(() => new LocalAuthService(), []);
  const connectionManager = useMemo(() => new RobotConnectionManager(), []);
  const dispatcher = useMemo(() => new RobotCommandDispatcher(connectionManager), [connectionManager]);
  const [authenticated, setAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => connectionManager.onStatusChange(({ status }) => setConnectionStatus(status)), [connectionManager]);

  const handleLogin = (username, password) => {
    const result = authService.login(username, password);
    if (result.valid) {
      setAuthenticated(true);
    }
    return result;
  };

  if (!authenticated) {
    return React.createElement(LoginScreen, { onLogin: handleLogin });
  }

  return React.createElement(
    SafeAreaView,
    { style: { flex: 1 } },
    React.createElement(ControllerScreen, {
      connectionStatus,
      connectWifi: () => connectionManager.connect({ type: 'wifi' }).catch(() => {}),
      connectBluetooth: () => connectionManager.connect({ type: 'bluetooth' }).catch(() => {}),
      disconnect: () => connectionManager.disconnect().catch(() => {}),
      sendAction: (action) => dispatcher.sendAction(action).catch(() => false),
    }),
  );
}

module.exports = { AgentApp };
