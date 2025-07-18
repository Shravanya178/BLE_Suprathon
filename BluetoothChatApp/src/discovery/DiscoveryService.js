import manager from '../bluetooth/BleManager';

export const discoverPeers = onPeerFound => {
  manager.startDeviceScan(null, null, (error, device) => {
    if (device?.name?.includes('BTChatUser')) onPeerFound(device);
  });
};
