/**
 * OfflineChatX - Peer-to-Peer Bluetooth Chat App
 * Built with React Native and BLE
 *
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';

import { BluetoothService } from './src/services/BluetoothService';
import { MessageStorage } from './src/services/MessageStorage';
import ChatMessage from './src/components/ChatMessage';
import ConnectionStatus from './src/components/ConnectionStatus';
import DeviceList from './src/components/DeviceList';

function App(): React.JSX.Element {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeApp();
    return () => {
      BluetoothService.destroy();
    };
  }, []);

  const initializeApp = async () => {
    // Request permissions
    await requestPermissions();
    
    // Initialize Bluetooth service
    await BluetoothService.initialize();
    
    // Load saved messages
    const savedMessages = await MessageStorage.loadMessages();
    setMessages(savedMessages);
    
    // Set up Bluetooth service callbacks
    BluetoothService.setOnMessageReceived(handleMessageReceived);
    BluetoothService.setOnConnectionStatusChanged(handleConnectionStatusChanged);
    BluetoothService.setOnDeviceFound(handleDeviceFound);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);
        
        const allGranted = Object.values(grants).every(
          grant => grant === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Bluetooth and location permissions are required for the app to work properly.'
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    }
  };

  const handleMessageReceived = async (messageText) => {
    const newMessage = await MessageStorage.addMessage({
      text: messageText,
      sender: 'peer',
      encrypted: true,
    });
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleConnectionStatusChanged = (connected, device, error) => {
    setIsConnected(connected);
    setIsConnecting(false);
    setConnectedDevice(device);
    setConnectionError(error || '');
    
    if (connected) {
      setShowDeviceList(false);
      setAvailableDevices([]);
    }
  };

  const handleDeviceFound = (device) => {
    setAvailableDevices(prevDevices => {
      const exists = prevDevices.find(d => d.id === device.id);
      if (!exists) {
        return [...prevDevices, device];
      }
      return prevDevices;
    });
  };

  const startScanning = () => {
    if (!isScanning) {
      setIsScanning(true);
      setAvailableDevices([]);
      setShowDeviceList(true);
      
      BluetoothService.startScanning();
      
      // Stop scanning after 30 seconds
      setTimeout(() => {
        setIsScanning(false);
        BluetoothService.stopScanning();
      }, 30000);
    }
  };

  const connectToDevice = async (device) => {
    try {
      setIsConnecting(true);
      setConnectionError('');
      await BluetoothService.connectToDevice(device);
    } catch (error) {
      setIsConnecting(false);
      setConnectionError(error.message);
      Alert.alert('Connection Failed', error.message);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !isConnected) return;
    
    try {
      // Send message via Bluetooth
      await BluetoothService.sendMessage(inputText);
      
      // Save message locally
      const newMessage = await MessageStorage.addMessage({
        text: inputText,
        sender: 'me',
        encrypted: true,
      });
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      Alert.alert('Send Failed', error.message);
    }
  };

  const disconnect = async () => {
    await BluetoothService.disconnect();
    setShowDeviceList(false);
  };

  const handleStatusPress = () => {
    if (!isConnected && !isConnecting) {
      startScanning();
    }
  };

  const renderMessage = ({ item }) => (
    <ChatMessage 
      message={item} 
      isOwnMessage={item.sender === 'me'} 
    />
  );

  const renderChatInterface = () => (
    <View style={styles.chatContainer}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#8E8E93"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || !isConnected) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || !isConnected}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OfflineChatX</Text>
        {isConnected && (
          <TouchableOpacity onPress={disconnect} style={styles.disconnectButton}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity onPress={handleStatusPress} activeOpacity={0.8}>
        <ConnectionStatus
          isConnected={isConnected}
          deviceName={connectedDevice?.name}
          isConnecting={isConnecting}
          errorMessage={connectionError}
        />
      </TouchableOpacity>
      
      {showDeviceList ? (
        <DeviceList
          devices={availableDevices}
          onDeviceSelect={connectToDevice}
          onStartScan={startScanning}
          isScanning={isScanning}
        />
      ) : (
        renderChatInterface()
      )}
    </SafeAreaView>
  );
}

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
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#0084FF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
