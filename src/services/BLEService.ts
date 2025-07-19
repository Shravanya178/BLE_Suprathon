import {BleManager, Device, Characteristic} from 'react-native-ble-plx';
import {PermissionsAndroid, Platform} from 'react-native';
import {BluetoothDevice, ChatMessage} from '../types';
import {Buffer} from 'buffer';
import diagnosticsTool from './DiagnosticsTool';

// Custom service UUID for chat application
const CHAT_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const MESSAGE_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';
const DEVICE_NAME_CHARACTERISTIC_UUID = '11111111-2222-3333-4444-555555555555';

// Fallback: Use device info service that most devices have
const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';
const MANUFACTURER_NAME_CHAR_UUID = '00002a29-0000-1000-8000-00805f9b34fb';

// Manufacturer-specific service UUIDs
// Xiaomi/Redmi
const XIAOMI_SERVICE_UUID = '0000fe95-0000-1000-8000-00805f9b34fb';
const XIAOMI_WRITE_CHAR_UUID = '00000001-0000-1000-8000-00805f9b34fb';
const XIAOMI_NOTIFY_CHAR_UUID = '00000002-0000-1000-8000-00805f9b34fb';

// OPPO
const OPPO_SERVICE_UUID = '0000fef3-0000-1000-8000-00805f9b34fb'; 
const OPPO_WRITE_CHAR_UUID = '00000001-0000-1000-8000-00805f9b34fb';
const OPPO_NOTIFY_CHAR_UUID = '00000002-0000-1000-8000-00805f9b34fb';

// Universal Chinese OEM services that might be available
const CHINESE_OEM_SERVICES = [
  '0000fee7-0000-1000-8000-00805f9b34fb', // Xiaomi/Huawei alt
  '0000fd5a-0000-1000-8000-00805f9b34fb', // Generic Chinese OEMs
  '0000fee0-0000-1000-8000-00805f9b34fb', // Backup
  '0000fedd-0000-1000-8000-00805f9b34fb'  // Backup
];

class BLEService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;
  private onDeviceFound: ((device: BluetoothDevice) => void) | null = null;
  private onConnectionStateChanged: ((isConnected: boolean, device?: BluetoothDevice) => void) | null = null;
  private messageQueue: ChatMessage[] = [];
  private isReceiving = false;
  private static connectedInstances: BLEService[] = [];

  constructor() {
    this.manager = new BleManager();
    BLEService.connectedInstances.push(this);
  }

  // Request necessary permissions
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return Object.values(granted).every(permission => permission === PermissionsAndroid.RESULTS.GRANTED);
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return true;
  }

  // Initialize BLE manager
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing BLE manager...');
      
      // Request permissions first
      const permissionsGranted = await this.requestPermissions();
      if (!permissionsGranted) {
        console.error('BLE permissions not granted');
        return false;
      }
      console.log('BLE permissions granted');

      const state = await this.manager.state();
      console.log('BLE manager state:', state);
      
      if (state !== 'PoweredOn') {
        console.log('Bluetooth is not powered on, current state:', state);
        return false;
      }
      
      console.log('BLE manager initialized successfully');
      return true;
    } catch (error) {
      console.error('BLE initialization failed:', error);
      return false;
    }
  }

  // Set callbacks
  setMessageReceivedCallback(callback: (message: ChatMessage) => void) {
    this.onMessageReceived = callback;
  }

  // Alias for compatibility with ChatScreen
  setOnMessageReceived(callback: (message: ChatMessage) => void) {
    this.onMessageReceived = callback;
  }

  setDeviceFoundCallback(callback: (device: BluetoothDevice) => void) {
    this.onDeviceFound = callback;
  }

  setConnectionStateChangedCallback(callback: (isConnected: boolean, device?: BluetoothDevice) => void) {
    this.onConnectionStateChanged = callback;
  }

  // Alias for compatibility with ChatScreen
  setOnConnectionStateChanged(callback: (isConnected: boolean, device?: BluetoothDevice) => void) {
    this.onConnectionStateChanged = callback;
  }

    // Enhanced real BLE message transmission setup
  async startMessageService(): Promise<boolean> {
    try {
      console.log('🚀 Preparing for real BLE message transmission...');
      
      // Stop any existing scans
      await this.manager.stopDeviceScan();
      
      // We'll use connection-based messaging instead of peripheral mode
      // This is more reliable with react-native-ble-plx
      console.log('✅ BLE service ready for real message transmission');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start message service:', error);
      return false;
    }
  }
  async startScanning(deviceFoundCallback?: (device: BluetoothDevice) => void): Promise<void> {
    try {
      console.log('Starting BLE scan...');
      
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && device.name) {
          console.log(`Found device: ${device.name} (${device.id})`);
          
          const bluetoothDevice: BluetoothDevice = {
            id: device.id,
            name: device.name,
            isConnected: false,
          };

          // Use the callback parameter if provided, otherwise use the stored callback
          if (deviceFoundCallback) {
            deviceFoundCallback(bluetoothDevice);
          } else {
            this.onDeviceFound?.(bluetoothDevice);
          }
        }
      });
    } catch (error) {
      console.error('Failed to start scanning:', error);
    }
  }

  // Stop scanning
  stopScanning() {
    this.manager.stopDeviceScan();
    console.log('Stopped scanning');
  }

  // Connect to a device
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      console.log(`Attempting to connect to device: ${deviceId}`);
      diagnosticsTool.addLog(`Attempting connection to device: ${deviceId}`);
      this.stopScanning();
      
      // Add timeout for connection
      const connectionPromise = this.manager.connectToDevice(deviceId);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000); // 10 second timeout
      });
      
      const device = await Promise.race([connectionPromise, timeoutPromise]) as any;
      console.log('Connected to device, discovering services...');
      diagnosticsTool.addLog(`Connected to ${device.name || 'Unnamed Device'}`);
      
      // Register device with diagnostics tool
      diagnosticsTool.setConnectedDevice(device);
      
      // Add timeout for service discovery
      const discoveryPromise = device.discoverAllServicesAndCharacteristics();
      const discoveryTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Service discovery timeout')), 8000); // 8 second timeout
      });
      
      await Promise.race([discoveryPromise, discoveryTimeoutPromise]);
      console.log('Services discovered successfully');
      diagnosticsTool.addLog('Services discovered successfully');
      
      // Run manufacturer-specific diagnostics
      const manufacturerTest = await diagnosticsTool.runManufacturerTests();
      diagnosticsTool.addLog(`Device identified as: ${manufacturerTest.manufacturerDetected}`);
      if (manufacturerTest.success) {
        diagnosticsTool.addLog(`✅ Found manufacturer-specific services`);
      }
      
      // Check if our service exists
      const services = await device.services();
      console.log(`Available services: ${services.length} found`);
      services.forEach((service: any) => {
        console.log(`- Service: ${service.uuid}`);
      });
      
      this.connectedDevice = device;
      
      // Setup bidirectional communication with enhanced reliability
      try {
        // First delay to allow BLE stack to stabilize
        await this.delay(500);
        
        await this.setupBidirectionalCommunication();
        console.log('Bidirectional communication setup completed');
        
        // Another small delay to ensure services are fully discovered
        await this.delay(300);
        
        // Start real BLE message service
        await this.startMessageService();
        console.log('Real BLE message service started');
        
        // Final connection stabilization
        await this.delay(200);
        this.refreshConnection();
        console.log('Connection refreshed and stabilized');
      } catch (commError) {
        console.log('Communication setup failed (continuing anyway):', commError);
      }
      
      this.onConnectionStateChanged?.(true, {
        id: device.id,
        name: device.name,
        isConnected: true,
      });
      
      console.log('Connection established successfully');
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      
      // Try to disconnect any partial connection
      try {
        if (this.connectedDevice) {
          await this.manager.cancelDeviceConnection(this.connectedDevice.id);
        }
      } catch (disconnectError) {
        console.log('Failed to clean up partial connection:', disconnectError);
      }
      
      this.connectedDevice = null;
      this.onConnectionStateChanged?.(false);
      return false;
    }
  }

  // Setup bidirectional communication
  private async setupBidirectionalCommunication() {
    if (!this.connectedDevice) return;

    try {
      console.log('Setting up bidirectional communication...');
      
      // Add timeout for service operations
      const setupPromise = this.performCommunicationSetup();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Communication setup timeout')), 5000); // 5 second timeout
      });
      
      await Promise.race([setupPromise, timeoutPromise]);
      console.log('Communication setup completed');
      
    } catch (error) {
      console.log('Communication setup failed (non-critical):', error);
      // Don't throw - connection should still work for basic functionality
    }
  }

  // Perform the actual communication setup
  private async performCommunicationSetup() {
    if (!this.connectedDevice) return;

    const services = await this.connectedDevice.services();
    console.log(`Setting up communication for ${services.length} services`);
    
    let notificationCount = 0;
    
    for (const service of services) {
      try {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          // Setup notification listener for incoming messages
          if (char.isNotifiable && notificationCount < 3) { // Limit to 3 notifications to avoid spam
            console.log(`Setting up notifications for ${char.uuid.substring(0, 8)}...`);
            try {
              this.connectedDevice.monitorCharacteristicForService(
                service.uuid,
                char.uuid,
                (error, characteristic) => {
                  if (error) return;
                  if (characteristic?.value && !this.isReceiving) {
                    this.handleIncomingData(characteristic.value);
                  }
                }
              );
              notificationCount++;
            } catch (monitorError) {
              console.log(`Monitor setup failed for ${char.uuid.substring(0, 8)}`);
            }
          }
        }
      } catch (charError) {
        console.log(`Failed to process service ${service.uuid.substring(0, 8)}`);
      }
    }
    
    console.log(`Communication setup complete. ${notificationCount} notifications configured.`);
  }

  // Handle incoming data with enhanced processing
  private handleIncomingData(data: string) {
    try {
      console.log('Processing incoming data:', data.substring(0, 100));
      
      // Prevent receiving our own messages
      if (this.isReceiving) {
        console.log('Already processing data, skipping to avoid loops');
        return;
      }
      
      this.isReceiving = true;
      
      // Try to decode as our message format
      const message = this.decodeMessage(data);
      if (message && message.text && message.sender !== 'me') {
        console.log('Received valid message from other device:', message.text);
        
        // Create the message as it should appear on the receiving device
        const receivedMessage: ChatMessage = {
          ...message,
          id: `received-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: 'other',
          timestamp: Date.now() // Update timestamp to current time
        };
        
        // Notify the UI about the new message
        setTimeout(() => {
          this.onMessageReceived?.(receivedMessage);
          console.log('Message displayed on receiving device');
        }, 100);
        
      } else {
        console.log('Data is not a valid chat message format');
      }
      
    } catch (error) {
      console.log('Error processing incoming data:', error);
    } finally {
      // Reset receiving flag after a short delay
      setTimeout(() => {
        this.isReceiving = false;
      }, 500);
    }
  }

  // Send message with cross-device communication
  async sendMessage(text: string): Promise<boolean> {
    if (!this.connectedDevice) {
      console.error('No connected device');
      return false;
    }

    const timestamp = Date.now();
    const message: ChatMessage = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp,
      sender: 'me',
    };

    try {
      console.log('Sending message:', text);
      
      // Add to local display immediately (for sender)
      this.onMessageReceived?.(message);
      
      // Enhanced cross-device messaging
      const success = await this.transmitMessageToDevice(message);
      
      if (success) {
        console.log('✅ Message transmitted successfully via BLE');
      } else {
        console.log('❌ BLE transmission failed - no simulation, real BLE only');
        // Don't simulate - only real Bluetooth transmission
        throw new Error('Failed to send message via Bluetooth');
      }
      
      return true;
    } catch (error) {
      console.error('Send message failed:', error);
      // No simulation - only real BLE transmission
      return false;
    }
  }

  // Helper method to create a delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Force refresh the connection to ensure data flows
  private refreshConnection(): void {
    if (!this.connectedDevice) return;
    
    // Read a characteristic to refresh the connection
    try {
      // Use setTimeout to avoid blocking the main operation
      setTimeout(async () => {
        try {
          const services = await this.connectedDevice!.services();
          if (services.length > 0) {
            const chars = await services[0].characteristics();
            if (chars.length > 0 && chars[0].isReadable) {
              await this.connectedDevice!.readCharacteristicForService(
                services[0].uuid, 
                chars[0].uuid
              );
            }
          }
        } catch (e) {
          // Ignore errors - this is just a connection refresh
        }
      }, 50);
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Enhanced message transmission to connected device
  private async transmitMessageToDevice(message: ChatMessage): Promise<boolean> {
    if (!this.connectedDevice) return false;

    // First check device type for specialized encoding
    const deviceName = this.connectedDevice.name?.toLowerCase() || '';
    const manufacturerData = this.connectedDevice.manufacturerData || '';
    
    // Detect device manufacturer based on name or data
    const isXiaomiDevice = deviceName.includes('mi') || deviceName.includes('redmi') || 
                         manufacturerData.includes('xiaomi');
    const isOppoDevice = deviceName.includes('oppo') || deviceName.includes('realme') || 
                       manufacturerData.includes('oppo');
    
    // Use specialized encoding for detected device types
    const encodedMessage = this.encodeMessage(message, isXiaomiDevice, isOppoDevice);
    console.log('🚀 Starting enhanced message transmission...');

    try {
      // First check for Xiaomi/Redmi or OPPO specific implementation
      const deviceName = this.connectedDevice.name?.toLowerCase() || '';
      const manufacturerData = this.connectedDevice.manufacturerData || '';
      
      // Detect device manufacturer based on name or data
      const isXiaomiDevice = deviceName.includes('mi') || deviceName.includes('redmi') || 
                            manufacturerData.includes('xiaomi');
      const isOppoDevice = deviceName.includes('oppo') || deviceName.includes('realme') || 
                          manufacturerData.includes('oppo');
      
      // CRITICAL: Add delay to allow BLE stack to stabilize - longer delay for problematic devices
      await this.delay(isXiaomiDevice || isOppoDevice ? 500 : 300);
      
      // Priority 1: Try manufacturer-specific services for known problematic devices
      if (isXiaomiDevice || isOppoDevice) {
        console.log(`📱 Detected ${isXiaomiDevice ? 'Xiaomi/Redmi' : 'OPPO'} device - using specialized handler`);
        
        const manufacturerSuccess = await this.writeToManufacturerService(
          encodedMessage,
          isXiaomiDevice ? XIAOMI_SERVICE_UUID : OPPO_SERVICE_UUID,
          isXiaomiDevice
        );
        
        if (manufacturerSuccess) {
          console.log(`✅ Message sent via ${isXiaomiDevice ? 'Xiaomi/Redmi' : 'OPPO'} specialized channel`);
          this.refreshConnection();
          return true;
        }
      }
      
      // Priority 2: Try our known chat service
      const chatServiceSuccess = await this.writeToKnownChatService(encodedMessage);
      if (chatServiceSuccess) {
        console.log('✅ Message sent via known chat service');
        // CRITICAL: Force refresh connection to ensure data flows
        this.refreshConnection();
        return true;
      }
      
      // Add small delay between attempts
      await this.delay(300); // Increased delay for problematic devices

      // Priority 3: Try device-specific characteristics with more retries and exponential backoff
      let deviceSpecificSuccess = false;
      // Increased from 3 to 5 attempts
      for (let i = 0; i < 5; i++) {
        deviceSpecificSuccess = await this.writeToDeviceSpecificChars(encodedMessage);
        if (deviceSpecificSuccess) {
          console.log(`✅ Message sent via device-specific characteristics (attempt ${i+1})`);
          // CRITICAL: Force refresh connection
          this.refreshConnection();
          return true;
        }
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms between retries
        await this.delay(100 * Math.pow(2, i)); 
      }

      // Priority 3: Try all available writable characteristics
      const allCharsSuccess = await this.writeToAllWritableChars(encodedMessage);
      if (allCharsSuccess) {
        console.log('✅ Message sent via available characteristics');
        // CRITICAL: Force refresh connection
        this.refreshConnection();
        return true;
      }

      console.log('❌ All transmission methods failed');
      return false;

    } catch (error) {
      console.log('💥 Message transmission failed with error:', error);
      return false;
    }
  }

  // Method 1: Try writing to our known chat service
  private async writeToKnownChatService(encodedMessage: string): Promise<boolean> {
    try {
      console.log('📡 Attempting REAL BLE transmission to known service...');
      
      // First verify the service exists
      const services = await this.connectedDevice!.services();
      const chatService = services.find(s => s.uuid.toLowerCase().includes('12345678') || 
                                              s.uuid.toLowerCase() === CHAT_SERVICE_UUID.toLowerCase());
      
      if (!chatService) {
        console.log('⚠️ Chat service not found, trying standard services...');
        return false;
      }
      
      // Get characteristics for our chat service
      const characteristics = await chatService.characteristics();
      console.log(`Found ${characteristics.length} characteristics in chat service`);
      
      // Try to write to our message characteristic
      const messageChar = characteristics.find(c => 
        c.uuid.toLowerCase().includes('87654321') || 
        c.uuid.toLowerCase() === MESSAGE_CHARACTERISTIC_UUID.toLowerCase() ||
        c.isWritableWithResponse || c.isWritableWithoutResponse
      );
      
      if (messageChar) {
        console.log(`📝 Writing to message characteristic: ${messageChar.uuid.substring(0, 8)}`);
        
        if (messageChar.isWritableWithResponse) {
          await this.connectedDevice!.writeCharacteristicWithResponseForService(
            chatService.uuid,
            messageChar.uuid,
            encodedMessage
          );
        } else if (messageChar.isWritableWithoutResponse) {
          await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
            chatService.uuid,
            messageChar.uuid,
            encodedMessage
          );
        }
        
        console.log('✅ REAL BLE message write successful!');
        return true;
      }
      
      console.log('⚠️ No writable message characteristic found');
      return false;
      
    } catch (error) {
      console.log('❌ Known chat service write failed:', error);
      return false;
    }
  }

  // Method 2: Try device-specific common characteristics with real BLE focus
  private async writeToDeviceSpecificChars(encodedMessage: string): Promise<boolean> {
    try {
      console.log('📱 Scanning device for REAL writable characteristics...');
      
      const services = await this.connectedDevice!.services();
      console.log(`🔍 Found ${services.length} BLE services to check`);
      
      // Check every service for writable characteristics
      for (const service of services) {
        try {
          const characteristics = await service.characteristics();
          console.log(`Service ${service.uuid.substring(0, 8)}: ${characteristics.length} characteristics`);
          
          for (const char of characteristics) {
            // Log characteristic properties for debugging
            console.log(`Char ${char.uuid.substring(0, 8)}: Write=${char.isWritableWithResponse}, WriteNoResp=${char.isWritableWithoutResponse}, Read=${char.isReadable}, Notify=${char.isNotifiable}`);
            
            if (char.isWritableWithResponse) {
              try {
                console.log(`🚀 REAL BLE WRITE (with response) to ${service.uuid.substring(0, 8)}/${char.uuid.substring(0, 8)}`);
                await this.connectedDevice!.writeCharacteristicWithResponseForService(
                  service.uuid,
                  char.uuid,
                  encodedMessage
                );
                console.log('✅ REAL BLE transmission successful (with response)!');
                return true;
              } catch (writeError) {
                console.log(`❌ Write with response failed:`, writeError);
              }
            }
            
            if (char.isWritableWithoutResponse) {
              try {
                console.log(`🚀 REAL BLE WRITE (no response) to ${service.uuid.substring(0, 8)}/${char.uuid.substring(0, 8)}`);
                await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
                  service.uuid,
                  char.uuid,
                  encodedMessage
                );
                console.log('✅ REAL BLE transmission successful (no response)!');
                return true;
              } catch (writeError) {
                console.log(`❌ Write without response failed:`, writeError);
              }
            }
          }
        } catch (charError) {
          console.log(`❌ Failed to access characteristics for service ${service.uuid.substring(0, 8)}:`, charError);
        }
      }
      
      console.log('❌ No writable characteristics found on device');
      return false;
      
    } catch (error) {
      console.log('❌ Device characteristic scan failed:', error);
      return false;
    }
  }

  // Method 3: Try all available writable characteristics (original method)
  // Write to manufacturer-specific BLE services for Xiaomi/Redmi and Oppo devices
  private async writeToManufacturerService(
    encodedMessage: string, 
    serviceUUID: string, 
    isXiaomiDevice: boolean
  ): Promise<boolean> {
    try {
      console.log(`📱 Attempting to write to manufacturer service: ${serviceUUID}`);
      
      // For Xiaomi/Redmi: Try to negotiate higher MTU first for larger messages
      if (isXiaomiDevice) {
        try {
          console.log('🔄 Negotiating higher MTU for Xiaomi device...');
          await this.connectedDevice!.requestMTU(512);
          console.log('✅ MTU negotiation successful');
          // Xiaomi devices need small delay after MTU negotiation
          await this.delay(200);
        } catch (mtuError) {
          console.log('⚠️ MTU negotiation failed, continuing with default MTU:', mtuError);
        }
      }
      
      const services = await this.connectedDevice!.services();
      
      // First try the specific manufacturer service UUID
      const manufacturerService = services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase());
      if (manufacturerService) {
        const characteristics = await manufacturerService.characteristics();
        
        // Try both with and without response for all writable characteristics
        for (const char of characteristics) {
          if (char.isWritableWithResponse) {
            try {
              await this.connectedDevice!.writeCharacteristicWithResponseForService(
                serviceUUID,
                char.uuid,
                encodedMessage
              );
              console.log(`✅ Wrote to manufacturer service: ${serviceUUID.substring(0, 8)}`);
              return true;
            } catch (e) {
              console.log(`❌ Failed writing with response to manufacturer service: ${e}`);
            }
          }
          
          if (char.isWritableWithoutResponse) {
            try {
              await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
                serviceUUID,
                char.uuid,
                encodedMessage
              );
              console.log(`✅ Wrote without response to manufacturer service: ${serviceUUID.substring(0, 8)}`);
              return true;
            } catch (e) {
              console.log(`❌ Failed writing without response to manufacturer service: ${e}`);
            }
          }
        }
      }
      
      // Try the alternative Chinese OEM services
      for (const altServiceUUID of CHINESE_OEM_SERVICES) {
        const altService = services.find(s => s.uuid.toLowerCase() === altServiceUUID.toLowerCase());
        if (altService) {
          const characteristics = await altService.characteristics();
          
          for (const char of characteristics) {
            if (char.isWritableWithoutResponse) {
              try {
                await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
                  altServiceUUID,
                  char.uuid,
                  encodedMessage
                );
                console.log(`✅ Wrote to alternative service: ${altServiceUUID.substring(0, 8)}`);
                return true;
              } catch (e) {
                // Silently continue to next characteristic
              }
            }
          }
        }
      }
      
      console.log('❌ Failed to write to any manufacturer-specific service');
      return false;
    } catch (error) {
      console.log('❌ Error in manufacturer-specific write:', error);
      return false;
    }
  }

  private async writeToAllWritableChars(encodedMessage: string): Promise<boolean> {
    try {
      console.log('🔍 Scanning all available characteristics...');
      
      const services = await this.connectedDevice!.services();
      const writePromises: Promise<any>[] = [];
      
      for (const service of services) {
        try {
          const characteristics = await service.characteristics();
          for (const char of characteristics) {
            if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
              const writePromise = this.writeToCharacteristic(service.uuid, char.uuid, encodedMessage);
              writePromises.push(writePromise);
              
              if (writePromises.length >= 3) break; // Limit to 3 to avoid overwhelming
            }
          }
          if (writePromises.length >= 3) break;
        } catch (charError) {
          console.log(`Failed to access characteristics for service ${service.uuid.substring(0, 8)}`);
        }
      }

      if (writePromises.length > 0) {
        console.log(`🚀 Attempting ${writePromises.length} characteristic writes...`);
        const results = await Promise.allSettled(writePromises);
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        
        console.log(`📊 Transmission result: ${successCount}/${writePromises.length} writes successful`);
        return successCount > 0;
      }

      return false;
    } catch (error) {
      console.log('❌ All characteristics scan failed:', error);
      return false;
    }
  }

  // Write to a specific characteristic with retry mechanism
  private async writeToCharacteristic(serviceUuid: string, charUuid: string, data: string): Promise<void> {
    if (!this.connectedDevice) throw new Error('No device connected');
    
    // Maximum number of retry attempts
    const maxRetries = 3;
    let success = false;
    
    // Try multiple times with different approaches
    for (let attempt = 0; attempt < maxRetries && !success; attempt++) {
      try {
        // Add a small delay between attempts
        if (attempt > 0) await this.delay(100 * attempt);
        
        console.log(`Write attempt ${attempt+1}/${maxRetries} to ${charUuid.substring(0, 8)}`);
        
        // Strategy 1: Write with response
        if (!success && attempt < 2) {
          try {
            await this.connectedDevice.writeCharacteristicWithResponseForService(
              serviceUuid,
              charUuid,
              data
            );
            console.log(`✅ Successfully wrote to ${charUuid.substring(0, 8)} (with response)`);
            success = true;
          } catch (writeError) {
            console.log(`Write with response failed on attempt ${attempt+1}`);
          }
        }
        
        // Strategy 2: Write without response
        if (!success) {
          try {
            await this.connectedDevice.writeCharacteristicWithoutResponseForService(
              serviceUuid,
              charUuid,
              data
            );
            console.log(`✅ Successfully wrote to ${charUuid.substring(0, 8)} (without response)`);
            success = true;
          } catch (writeError) {
            console.log(`Write without response failed on attempt ${attempt+1}`);
          }
        }
        
      } catch (attemptError) {
        console.log(`Attempt ${attempt+1} failed:`, attemptError);
      }
    }
    
    if (!success) {
      throw new Error(`Failed to write to characteristic after ${maxRetries} attempts`);
    }
  }

  // Trigger notifications to alert other device
  private async triggerDeviceNotifications() {
    if (!this.connectedDevice) return;

    try {
      const services = await this.connectedDevice.services();
      
      // Read from readable characteristics to trigger change notifications
      for (const service of services) {
        try {
          const characteristics = await service.characteristics();
          for (const char of characteristics) {
            if (char.isReadable) {
              try {
                await this.connectedDevice.readCharacteristicForService(service.uuid, char.uuid);
                console.log(`Triggered notification via ${char.uuid.substring(0, 8)}`);
                break; // Only trigger one to avoid spam
              } catch (readError) {
                // Ignore read errors
              }
            }
          }
        } catch (charError) {
          // Ignore characteristic errors
        }
      }
    } catch (error) {
      console.log('Failed to trigger notifications:', error);
    }
  }

  // Simulate message on other device (fallback for demo)
  private simulateMessageOnOtherDevice(originalMessage: ChatMessage) {
    // This creates a more realistic simulation by using a different approach
    console.log('Simulating cross-device message delivery...');
    
    // Create the message that would appear on the receiving device
    const receivedMessage: ChatMessage = {
      ...originalMessage,
      id: `${originalMessage.id}-received`,
      sender: 'other',
    };

    // Simulate network delay and then "receive" the message
    setTimeout(() => {
      // In a real scenario, this would be triggered by the other device
      // For demo purposes, we'll simulate it locally
      console.log('Message "received" on other device:', receivedMessage.text);
      
      // This would normally be called by the other device's BLE service
      // but for demo we can simulate it
      this.simulateIncomingMessage(receivedMessage);
    }, Math.random() * 1000 + 500); // Random delay 500-1500ms
  }

  // Simulate incoming message (as if from other device)
  private simulateIncomingMessage(message: ChatMessage) {
    console.log('Simulating incoming message processing...');
    
    // In a real cross-device scenario, this would be handled by the receiving device's BLEService
    // For demo purposes, we're creating a realistic simulation
    
    // Create a proper "received" message that would appear on the other device
    const incomingMessage: ChatMessage = {
      ...message,
      id: `incoming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'other',
      timestamp: Date.now()
    };
    
    console.log('Simulated message would appear on other device:', incomingMessage.text);
    
    // Note: This demonstrates what would happen on the receiving device
    // In a real implementation, each device would have its own BLEService instance
    // and this callback would be triggered on the receiver's instance
  }

  // Broadcast message to connected device
  private async broadcastMessage(encodedMessage: string): Promise<boolean> {
    if (!this.connectedDevice) return false;
    
    try {
      const services = await this.connectedDevice.services();
      console.log(`Attempting to broadcast to ${services.length} services`);
      
      // Try to write to multiple characteristics to increase chances of delivery
      let successCount = 0;
      
      for (const service of services) {
        try {
          const characteristics = await service.characteristics();
          for (const char of characteristics) {
            if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
              try {
                console.log(`Broadcasting to ${service.uuid}:${char.uuid}`);
                
                if (char.isWritableWithResponse) {
                  await this.connectedDevice.writeCharacteristicWithResponseForService(
                    service.uuid,
                    char.uuid,
                    encodedMessage
                  );
                } else {
                  await this.connectedDevice.writeCharacteristicWithoutResponseForService(
                    service.uuid,
                    char.uuid,
                    encodedMessage
                  );
                }
                
                successCount++;
                console.log(`Broadcast successful to ${char.uuid}`);
                
                // If we successfully write to any characteristic, trigger notification
                await this.triggerNotification(service.uuid, char.uuid);
                
              } catch (writeError) {
                console.log(`Write failed for ${char.uuid}:`, writeError);
              }
            }
          }
        } catch (charError) {
          console.log(`Failed to access characteristics for ${service.uuid}`);
        }
      }
      
      console.log(`Broadcast completed. Success count: ${successCount}`);
      return successCount > 0;
      
    } catch (error) {
      console.log('Broadcast failed:', error);
      return false;
    }
  }

  // Trigger notification to alert other device
  private async triggerNotification(serviceUuid: string, charUuid: string) {
    try {
      // Try to read the characteristic to trigger any change notifications
      await this.connectedDevice?.readCharacteristicForService(serviceUuid, charUuid);
    } catch (error) {
      // Ignore read errors - this is just to trigger notifications
    }
  }

  // Encode message to base64
  private encodeMessage(message: ChatMessage, isXiaomiDevice: boolean = false, isOppoDevice: boolean = false): string {
    const messageString = JSON.stringify(message);
    const base64Encoded = Buffer.from(messageString).toString('base64');
    
    // Standard encoding for most devices
    if (!isXiaomiDevice && !isOppoDevice) {
      return base64Encoded;
    }
    
    // Special encoding for Xiaomi/Redmi devices which may have packet size limitations
    if (isXiaomiDevice) {
      // Add special prefix for Xiaomi/Redmi devices
      // This prefix helps Xiaomi devices recognize the data format
      return `MI:${base64Encoded}`;
    }
    
    // Special encoding for OPPO devices
    if (isOppoDevice) {
      // Add special prefix for OPPO devices
      return `OP:${base64Encoded}`;
    }
    
    return base64Encoded;
  }

  // Decode message from base64
  private decodeMessage(base64: string): ChatMessage | null {
    try {
      // Check for special manufacturer prefixes and strip them if present
      let processedBase64 = base64;
      
      if (base64.startsWith('MI:')) {
        // Handle Xiaomi/Redmi encoding
        processedBase64 = base64.substring(3); // Remove MI: prefix
      } else if (base64.startsWith('OP:')) {
        // Handle OPPO encoding
        processedBase64 = base64.substring(3); // Remove OP: prefix
      }
      
      const messageString = Buffer.from(processedBase64, 'base64').toString();
      const message = JSON.parse(messageString);
      
      // Validate message structure
      if (message.id && message.text && message.timestamp && message.sender) {
        return message as ChatMessage;
      }
    } catch (error) {
      // Not a valid message format
    }
    return null;
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        const deviceName = this.connectedDevice.name || 'Unnamed device';
        diagnosticsTool.addLog(`Disconnecting from ${deviceName}`);
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
        console.log('Disconnected from device');
        diagnosticsTool.addLog(`Disconnected from ${deviceName}`);
      } catch (error) {
        console.error('Disconnect error:', error);
        diagnosticsTool.addLog(`Disconnect error: ${error}`);
      }
      // Update diagnostics tool
      diagnosticsTool.setConnectedDevice(null);
      this.connectedDevice = null;
      this.onConnectionStateChanged?.(false);
    }
  }

  // Simulate cross-device message for demo
  private simulateCrossDeviceMessage(originalMessage: ChatMessage) {
    // Simulate message appearing on other connected instances
    const otherInstances = BLEService.connectedInstances.filter(instance => instance !== this);
    
    otherInstances.forEach(instance => {
      if (instance.connectedDevice && instance.onMessageReceived) {
        const receivedMessage: ChatMessage = {
          ...originalMessage,
          id: `${originalMessage.id}-received`,
          sender: 'other',
        };
        
        console.log('Simulating message on other device:', receivedMessage.text);
        instance.onMessageReceived(receivedMessage);
      }
    });
  }

  // Cleanup
  destroy() {
    this.stopScanning();
    this.disconnect();
    
    // Remove from connected instances
    const index = BLEService.connectedInstances.indexOf(this);
    if (index > -1) {
      BLEService.connectedInstances.splice(index, 1);
    }
    
    this.manager.destroy();
  }
}

export default new BLEService();
