import React from 'react';
import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import DeviceListScreen from '../src/components/DeviceListScreen';

// Mock BLE service
jest.mock('../src/services/BLEService', () => ({
  initialize: jest.fn().mockResolvedValue(true),
  startScanning: jest.fn(),
  stopScanning: jest.fn(),
  connectToDevice: jest.fn().mockResolvedValue(true),
  setOnMessageReceived: jest.fn(),
  setOnConnectionStateChanged: jest.fn(),
}));

describe('DeviceListScreen', () => {
  const renderWithNavigation = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        {component}
      </NavigationContainer>
    );
  };

  test('renders device list screen correctly', () => {
    const {getByText} = renderWithNavigation(<DeviceListScreen />);
    
    expect(getByText('Nearby Devices')).toBeTruthy();
    expect(getByText('Find other devices to chat with')).toBeTruthy();
    expect(getByText('Start Scanning')).toBeTruthy();
    expect(getByText('🔵 Offline Chat via Bluetooth')).toBeTruthy();
  });

  test('shows empty state when no devices found', () => {
    const {getByText} = renderWithNavigation(<DeviceListScreen />);
    
    expect(getByText('No devices found. Tap "Start Scanning" to search.')).toBeTruthy();
  });
});
