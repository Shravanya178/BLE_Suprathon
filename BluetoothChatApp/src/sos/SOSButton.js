import * as Location from 'expo-location';

export const sendSOS = async broadcast => {
  const { coords } = await Location.getCurrentPositionAsync({});
  broadcast({
    type: 'SOS',
    message: 'Help!',
    location: coords,
    timestamp: Date.now(),
  });
};
