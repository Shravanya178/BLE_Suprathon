import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeMessage = async msg => {
  const messages = JSON.parse(await AsyncStorage.getItem('messages')) || [];
  messages.push(msg);
  await AsyncStorage.setItem('messages', JSON.stringify(messages));
};

export const getMessages = async () => {
  return JSON.parse(await AsyncStorage.getItem('messages')) || [];
};
