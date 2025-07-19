import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const DeviceList = ({ devices, onDeviceSelect, onStartScan, isScanning }) => {
  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => onDeviceSelect(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>
          {item.name || 'Unknown Device'}
        </Text>
        <Text style={styles.deviceId}>
          {item.id}
        </Text>
        {item.rssi && (
          <Text style={styles.deviceRssi}>
            Signal: {item.rssi} dBm
          </Text>
        )}
      </View>
      <Text style={styles.connectButton}>Connect</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Devices</Text>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanningButton]}
          onPress={onStartScan}
          disabled={isScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {devices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {isScanning 
              ? 'Looking for OfflineChatX devices nearby...' 
              : 'No devices found'
            }
          </Text>
          <Text style={styles.emptySubtext}>
            Make sure the other device is running OfflineChatX and tap "Scan for Devices" on both devices simultaneously
          </Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          style={styles.deviceList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scanButton: {
    backgroundColor: '#0084FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  scanningButton: {
    backgroundColor: '#8E8E93',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  deviceId: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#8E8E93',
  },
  connectButton: {
    color: '#0084FF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DeviceList;
