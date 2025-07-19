import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';

/**
 * Diagnostics tool for BLE connections between Redmi and Oppo devices
 */
class DiagnosticsTool {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private logs: string[] = [];
  private connectionQuality: number = 0;
  
  constructor() {
    this.bleManager = new BleManager();
    this.initializeDiagnostics();
  }
  
  /**
   * Initialize diagnostics monitoring
   */
  private initializeDiagnostics(): void {
    // Monitor BLE state changes
    this.bleManager.onStateChange(state => {
      this.addLog(`BLE state changed: ${state}`);
    }, true);
    
    // Listen for connection events from native modules if available
    if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener('BleManagerConnectionChange', (args) => {
        const {deviceId, status} = args;
        this.addLog(`Connection change for ${deviceId}: ${status ? 'connected' : 'disconnected'}`);
      });
    }
  }
  
  /**
   * Set the currently connected device for diagnostics
   */
  public setConnectedDevice(device: Device | null): void {
    this.connectedDevice = device;
    if (device) {
      this.addLog(`Diagnostics monitoring device: ${device.name || 'Unnamed'} (${device.id})`);
      this.checkConnectionQuality();
    } else {
      this.addLog('Device disconnected, diagnostics stopped');
      this.connectionQuality = 0;
    }
  }
  
  /**
   * Add a diagnostic log entry
   */
  public addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.unshift(logEntry); // Add to beginning for newest first
    
    // Keep logs manageable
    if (this.logs.length > 100) {
      this.logs.pop();
    }
    
    console.log(`DIAGNOSTIC: ${message}`);
  }
  
  /**
   * Check the connection quality with the device
   */
  public async checkConnectionQuality(): Promise<number> {
    if (!this.connectedDevice) {
      this.connectionQuality = 0;
      return 0;
    }
    
    try {
      // Get RSSI as signal strength indicator
      const connectedDevice = await this.bleManager.readRSSIForDevice(this.connectedDevice.id);
      const rssi = connectedDevice.rssi || -100;
      
      // RSSI is usually negative, closer to 0 is better
      // -50 or better is excellent (100%)
      // -100 or worse is poor (0%)
      const rssiQuality = Math.min(100, Math.max(0, 100 - (Math.abs(rssi) - 50) * 2));
      
      // Get MTU size as data capacity indicator (higher is better)
      let mtuQuality = 50; // Default
      try {
        // Request a higher MTU and see what we get back
        const device = await this.bleManager.requestMTUForDevice(this.connectedDevice.id, 512);
        const mtu = device.mtu || 23;
        mtuQuality = Math.min(100, Math.max(0, (mtu / 512) * 100));
      } catch (e) {
        // MTU negotiation not supported
      }
      
      // Calculate overall quality
      this.connectionQuality = Math.round((rssiQuality * 0.7) + (mtuQuality * 0.3));
      
      this.addLog(`Connection quality: ${this.connectionQuality}% (RSSI: ${rssi}, Quality: ${rssiQuality}%)`);
      return this.connectionQuality;
    } catch (error) {
      this.addLog(`Failed to check connection quality: ${error}`);
      this.connectionQuality = 0;
      return 0;
    }
  }
  
  /**
   * Run manufacturer-specific tests for Xiaomi/Redmi and OPPO devices
   */
  public async runManufacturerTests(): Promise<{
    success: boolean;
    manufacturerDetected: string;
    details: string;
  }> {
    if (!this.connectedDevice) {
      return {
        success: false,
        manufacturerDetected: 'unknown',
        details: 'No device connected',
      };
    }
    
    const deviceName = this.connectedDevice.name?.toLowerCase() || '';
    const manufacturerData = this.connectedDevice.manufacturerData || '';
    
    // Try to detect manufacturer
    let manufacturer = 'unknown';
    if (deviceName.includes('mi') || deviceName.includes('redmi') || manufacturerData.includes('xiaomi')) {
      manufacturer = 'xiaomi';
    } else if (deviceName.includes('oppo') || deviceName.includes('realme') || manufacturerData.includes('oppo')) {
      manufacturer = 'oppo';
    }
    
    // Run manufacturer-specific tests
    try {
      const services = await this.connectedDevice.services();
      
      // Check for manufacturer-specific services
      const serviceUuids = services.map(s => s.uuid.toLowerCase());
      
      // Check for Xiaomi services
      const hasXiaomiServices = serviceUuids.some(uuid => 
        uuid.includes('fe95') || uuid.includes('fee7') || uuid.includes('feed')
      );
      
      // Check for OPPO services
      const hasOppoServices = serviceUuids.some(uuid =>
        uuid.includes('fef3') || uuid.includes('fee0') || uuid.includes('fefd')
      );
      
      if (hasXiaomiServices) {
        this.addLog('Xiaomi/Redmi services detected');
      }
      
      if (hasOppoServices) {
        this.addLog('OPPO services detected');
      }
      
      return {
        success: hasXiaomiServices || hasOppoServices,
        manufacturerDetected: manufacturer,
        details: `Found ${services.length} services. Xiaomi: ${hasXiaomiServices}, OPPO: ${hasOppoServices}`,
      };
    } catch (error) {
      this.addLog(`Manufacturer test failed: ${error}`);
      return {
        success: false,
        manufacturerDetected: manufacturer,
        details: `Error during test: ${error}`,
      };
    }
  }
  
  /**
   * Get the current connection quality (0-100%)
   */
  public getConnectionQuality(): number {
    return this.connectionQuality;
  }
  
  /**
   * Get the diagnostic logs
   */
  public getLogs(): string[] {
    return this.logs;
  }
}

// Singleton instance
const diagnosticsTool = new DiagnosticsTool();
export default diagnosticsTool;
