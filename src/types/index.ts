export interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi?: number;
  isConnected: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: number;
  sender: 'me' | 'other';
  deviceName?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  connectedDevice: BluetoothDevice | null;
  isScanning: boolean;
  isAdvertising: boolean;
}

export type NavigationParamList = {
  DeviceList: undefined;
  Chat: {
    device: BluetoothDevice;
  };
};
