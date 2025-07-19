import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ConnectionStatus = ({ isConnected, deviceName, isConnecting, errorMessage }) => {
  const getStatusText = () => {
    if (isConnecting) {
      return 'Connecting via Bluetooth...';
    }
    if (isConnected) {
      return `Connected via Bluetooth (Offline Mode)${deviceName ? ` - ${deviceName}` : ''}`;
    }
    if (errorMessage) {
      return `Connection Error: ${errorMessage}`;
    }
    return 'Not Connected - Tap to scan for devices';
  };

  const getStatusColor = () => {
    if (isConnecting) return '#FF9500'; // Orange
    if (isConnected) return '#4CD964'; // Green
    if (errorMessage) return '#FF3B30'; // Red
    return '#8E8E93'; // Gray
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>{getStatusText()}</Text>
      {isConnected && (
        <View style={styles.connectionIndicator}>
          <View style={styles.pulsingDot} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  connectionIndicator: {
    marginLeft: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});

export default ConnectionStatus;
