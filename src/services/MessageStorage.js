import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGES_KEY = 'OfflineChatX_Messages';
const DEVICE_INFO_KEY = 'OfflineChatX_DeviceInfo';

class MessageStorageClass {
  // Save messages to local storage
  async saveMessages(messages) {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  // Load messages from local storage
  async loadMessages() {
    try {
      const messagesString = await AsyncStorage.getItem(MESSAGES_KEY);
      return messagesString ? JSON.parse(messagesString) : [];
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  }

  // Add a new message
  async addMessage(message) {
    try {
      const messages = await this.loadMessages();
      const newMessage = {
        id: Date.now().toString(),
        text: message.text,
        sender: message.sender,
        timestamp: new Date().toISOString(),
        encrypted: message.encrypted || false,
      };
      
      messages.push(newMessage);
      await this.saveMessages(messages);
      
      return newMessage;
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  }

  // Clear all messages
  async clearMessages() {
    try {
      await AsyncStorage.removeItem(MESSAGES_KEY);
    } catch (error) {
      console.error('Failed to clear messages:', error);
    }
  }

  // Save device info
  async saveDeviceInfo(deviceInfo) {
    try {
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    } catch (error) {
      console.error('Failed to save device info:', error);
    }
  }

  // Load device info
  async loadDeviceInfo() {
    try {
      const deviceInfoString = await AsyncStorage.getItem(DEVICE_INFO_KEY);
      return deviceInfoString ? JSON.parse(deviceInfoString) : null;
    } catch (error) {
      console.error('Failed to load device info:', error);
      return null;
    }
  }
}

export const MessageStorage = new MessageStorageClass();
