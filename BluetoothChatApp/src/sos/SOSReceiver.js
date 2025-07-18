import { Alert, Vibration } from 'react-native';

export const handleSOS = msg => {
  if (msg.type === 'SOS') {
    Vibration.vibrate();
    Alert.alert(
      'SOS',
      `${msg.message}\nLocation: ${msg.location.latitude}, ${msg.location.longitude}`,
    );
  }
};
