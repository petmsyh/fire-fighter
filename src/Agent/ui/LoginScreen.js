const React = require('react');
const { useState } = React;
const { View, Text, TextInput, Pressable, StyleSheet } = require('react-native');

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const result = onLogin(username.trim(), password);
    if (!result.valid) {
      setError(result.error || 'Login failed');
      return;
    }

    setError('');
  };

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.title }, 'Fire Fighter Robot Login'),
    React.createElement(TextInput, {
      style: styles.input,
      value: username,
      autoCapitalize: 'none',
      placeholder: 'Username',
      onChangeText: setUsername,
    }),
    React.createElement(TextInput, {
      style: styles.input,
      value: password,
      secureTextEntry: true,
      placeholder: 'Password',
      onChangeText: setPassword,
    }),
    error ? React.createElement(Text, { style: styles.error }, error) : null,
    React.createElement(
      Pressable,
      { style: styles.loginButton, onPress: handleLogin },
      React.createElement(Text, { style: styles.loginLabel }, 'Login'),
    ),
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#101820' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  error: { color: '#ff7a7a', marginBottom: 12, textAlign: 'center' },
  loginButton: { backgroundColor: '#ff3b30', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  loginLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

module.exports = { LoginScreen };
