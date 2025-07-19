import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import BLEService from '../services/BLEService';
import {BluetoothDevice, NavigationParamList} from '../types';

type DeviceListNavigationProp = StackNavigationProp<NavigationParamList, 'DeviceList'>;

const DeviceListScreen: React.FC = () => {
  const navigation = useNavigation<DeviceListNavigationProp>();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeBLE();
    return () => {
      BLEService.stopScanning();
    };
  }, []);

  const initializeBLE = async () => {
    try {
      await BLEService.initialize();
      setIsInitialized(true);
    } catch (error) {
      Alert.alert('Bluetooth Error', 'Please enable Bluetooth and grant permissions');
      console.error('BLE initialization failed:', error);
    }
  };

  const startScanning = () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Bluetooth not initialized');
      return;
    }

    setDevices([]);
    setIsScanning(true);
    
    BLEService.startScanning((device) => {
      setDevices(prevDevices => {
        const exists = prevDevices.find(d => d.id === device.id);
        if (exists) return prevDevices;
        return [...prevDevices, device];
      });
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      stopScanning();
    }, 10000);
  };

  const stopScanning = () => {
    BLEService.stopScanning();
    setIsScanning(false);
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsScanning(false);
    BLEService.stopScanning();

    try {
      const connected = await BLEService.connectToDevice(device.id);
      if (connected) {
        navigation.navigate('Chat', {device});
      } else {
        Alert.alert('Connection Failed', 'Could not connect to device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to device');
      console.error('Connection error:', error);
    }
  };

  const renderDevice = ({item}: {item: BluetoothDevice}) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        {item.rssi && <Text style={styles.deviceRssi}>RSSI: {item.rssi}</Text>}
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Devices</Text>
        <Text style={styles.subtitle}>Find other devices to chat with</Text>
      </View>

      <View style={styles.scanSection}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={isScanning ? stopScanning : startScanning}
          disabled={!isInitialized}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>
        
        {isScanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.scanningText}>Scanning for devices...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        style={styles.deviceList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {!isInitialized 
                ? 'Initializing Bluetooth...' 
                : isScanning 
                ? 'Looking for devices...' 
                : 'No devices found. Tap "Start Scanning" to search.'}
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>🔵 Offline Chat via Bluetooth</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  scanSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#FF3B30',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'center',
  },
  scanningText: {
    marginLeft: 10,
    color: '#6c757d',
    fontSize: 14,
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  deviceId: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#28a745',
  },
  connectButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  footerText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DeviceListScreen;
