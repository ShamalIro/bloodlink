import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { API_URL } from './src/services/api';
import { login } from './src/services/authApi';

// TEMPORARY connectivity test: phone -> gateway (4000) -> auth-service.
// Replaced by the real navigator once this works.
export default function App() {
  const [out, setOut] = useState('Tap the button to test the gateway.');

  const test = async () => {
    setOut('Calling...');
    try {
      const data = await login({ email: 'test@example.com', password: 'Test1234' });
      setOut(`OK\nuser: ${data.user.name} (${data.user.role})\ntoken: ${data.token.slice(0, 20)}...`);
    } catch (e) {
      setOut(`FAILED\n${e.message}\n${JSON.stringify(e.response?.data ?? {})}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BloodLink</Text>
      <Text style={styles.url}>{API_URL}</Text>
      <Button title="Test login via gateway" color="#C0272D" onPress={test} />
      <Text style={styles.out}>{out}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#C0272D', marginBottom: 8 },
  url: { color: '#6B6B76', marginBottom: 16 },
  out: { marginTop: 24, fontSize: 15, color: '#1B1B1F' },
});