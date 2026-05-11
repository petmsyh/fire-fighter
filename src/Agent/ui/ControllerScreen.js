const React = require('react');
const { View, Text, Pressable, StyleSheet } = require('react-native');

function DirectionButton({ label, action, disabled, onPressIn, onPressOut }) {
  return React.createElement(
    Pressable,
    {
      style: ({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ],
      disabled,
      onPressIn: () => onPressIn(action),
      onPressOut: onPressOut,
    },
    React.createElement(Text, { style: styles.buttonLabel }, label),
  );
}

function ControllerScreen({
  connectionStatus,
  connectWifi,
  connectBluetooth,
  disconnect,
  sendAction,
}) {
  const connected = connectionStatus === 'connected';

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.header }, 'Robot Controller'),
    React.createElement(Text, { style: styles.status }, `Status: ${connectionStatus}`),
    React.createElement(
      View,
      { style: styles.connectionRow },
      React.createElement(
        Pressable,
        { style: styles.connectionButton, onPress: connectWifi },
        React.createElement(Text, { style: styles.connectionButtonLabel }, 'Connect Wi‑Fi'),
      ),
      React.createElement(
        Pressable,
        { style: styles.connectionButton, onPress: connectBluetooth },
        React.createElement(Text, { style: styles.connectionButtonLabel }, 'Connect Bluetooth'),
      ),
      React.createElement(
        Pressable,
        { style: styles.disconnectButton, onPress: disconnect },
        React.createElement(Text, { style: styles.connectionButtonLabel }, 'Disconnect'),
      ),
    ),
    React.createElement(DirectionButton, { label: 'Forward', action: 'FORWARD', disabled: !connected, onPressIn: sendAction, onPressOut: () => {} }),
    React.createElement(
      View,
      { style: styles.middleRow },
      React.createElement(DirectionButton, { label: 'Left', action: 'LEFT', disabled: !connected, onPressIn: sendAction, onPressOut: () => {} }),
      React.createElement(DirectionButton, { label: 'Right', action: 'RIGHT', disabled: !connected, onPressIn: sendAction, onPressOut: () => {} }),
    ),
    React.createElement(DirectionButton, { label: 'Backward', action: 'BACKWARD', disabled: !connected, onPressIn: sendAction, onPressOut: () => {} }),
    React.createElement(
      Pressable,
      {
        style: ({ pressed }) => [styles.stopButton, pressed ? styles.buttonPressed : null],
        onPress: () => sendAction('STOP'),
      },
      React.createElement(Text, { style: styles.stopButtonLabel }, 'STOP'),
    ),
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1a2b', padding: 20, justifyContent: 'center' },
  header: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  status: { color: '#9ad0ff', textAlign: 'center', marginVertical: 16, fontSize: 16 },
  connectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 8 },
  connectionButton: { flex: 1, borderRadius: 10, backgroundColor: '#2b80ff', paddingVertical: 10, alignItems: 'center' },
  disconnectButton: { flex: 1, borderRadius: 10, backgroundColor: '#475569', paddingVertical: 10, alignItems: 'center' },
  connectionButtonLabel: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  button: { marginVertical: 8, borderRadius: 14, backgroundColor: '#1f9d55', paddingVertical: 24, alignItems: 'center' },
  middleRow: { flexDirection: 'row', gap: 12 },
  buttonPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.45 },
  buttonLabel: { color: '#fff', fontWeight: '700', fontSize: 20 },
  stopButton: { borderRadius: 16, backgroundColor: '#dc2626', paddingVertical: 28, alignItems: 'center', marginTop: 8 },
  stopButtonLabel: { color: '#fff', fontWeight: '800', fontSize: 26, letterSpacing: 1 },
});

module.exports = { ControllerScreen };
