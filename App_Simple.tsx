import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

const App = () => {
  const showAlert = () => {
    Alert.alert(
      "OfflineChatX", 
      "Your Bluetooth P2P Chat App is working! 🎉\n\nThis is a test version. The full app with BLE functionality will be loaded next.", 
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OfflineChatX</Text>
      <Text style={styles.subtitle}>Bluetooth P2P Chat</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>🔵 App Loaded Successfully</Text>
        <Text style={styles.statusText}>📱 Running on Physical Device</Text>
        <Text style={styles.statusText}>✅ React Native Working</Text>
      </View>

      <Button 
        title="Test App 🚀" 
        onPress={showAlert}
        color="#007AFF"
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This confirms your React Native setup is working correctly!
        </Text>
        <Text style={styles.infoText}>
          The full BLE chat functionality will be added next.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default App;
