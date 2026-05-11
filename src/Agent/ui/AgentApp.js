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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => connectionManager.onStatusChange(({ status }) => setConnectionStatus(status)), [connectionManager]);

  const handleLogin = (username, password) => {
    const result = authService.login(username, password);
    if (result.valid) {
      setAuthenticated(true);
    }
    return result;
  };

  const connectWifi = () => connectionManager.connect({ type: 'wifi' })
    .then(() => setErrorMessage(''))
    .catch((error) => setErrorMessage(error.message));

  const connectBluetooth = () => connectionManager.connect({ type: 'bluetooth' })
    .then(() => setErrorMessage(''))
    .catch((error) => setErrorMessage(error.message));

  const disconnectRobot = () => connectionManager.disconnect()
    .then(() => setErrorMessage(''))
    .catch((error) => setErrorMessage(error.message));

  const sendAction = (action) => dispatcher.sendAction(action)
    .then((sent) => {
      if (sent) {
        setErrorMessage('');
      }
      return sent;
    })
    .catch((error) => {
      setErrorMessage(error.message);
      return false;
    });

  if (!authenticated) {
    return React.createElement(LoginScreen, { onLogin: handleLogin });
  }

  return React.createElement(
    SafeAreaView,
    { style: { flex: 1 } },
    React.createElement(ControllerScreen, {
      connectionStatus,
      errorMessage,
      connectWifi,
      connectBluetooth,
      disconnect: disconnectRobot,
      sendAction,
    }),
  );
}

module.exports = { AgentApp };
