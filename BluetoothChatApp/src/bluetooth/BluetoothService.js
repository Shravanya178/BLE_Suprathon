import manager from './BleManager';

export const scanForDevices = onDeviceFound => {
  manager.startDeviceScan(null, null, (error, device) => {
    if (error) return;
    if (device?.name?.includes('BTChat')) {
      manager.stopDeviceScan();
      onDeviceFound(device);
    }
  });
};

export const connectToDevice = async device => {
  const connected = await device.connect();
  await connected.discoverAllServicesAndCharacteristics();
  return connected;
};
