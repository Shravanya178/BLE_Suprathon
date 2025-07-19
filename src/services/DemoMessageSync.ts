// Synchronized Message Service for Demo
class DemoMessageSync {
  private static instance: DemoMessageSync;
  private messages: any[] = [];
  private deviceConnections = new Map();

  static getInstance() {
    if (!DemoMessageSync.instance) {
      DemoMessageSync.instance = new DemoMessageSync();
    }
    return DemoMessageSync.instance;
  }

  // Register device for message sync
  registerDevice(deviceId: string, messageCallback: (message: any) => void) {
    this.deviceConnections.set(deviceId, messageCallback);
    console.log(`Device ${deviceId} registered for message sync`);
  }

  // Broadcast message to all connected devices
  broadcastMessage(message: any, senderDeviceId: string) {
    console.log(`Broadcasting message from ${senderDeviceId}:`, message.text);
    
    // Add to message history
    this.messages.push(message);
    
    // Send to all other devices except sender
    this.deviceConnections.forEach((callback, deviceId) => {
      if (deviceId !== senderDeviceId) {
        console.log(`Sending message to device ${deviceId}`);
        // Create received message version
        const receivedMessage = {
          ...message,
          sender: 'other',
          id: `${message.id}-received`,
        };
        setTimeout(() => {
          callback(receivedMessage);
        }, 200); // Small delay to simulate BLE transmission
      }
    });
  }

  // Get message history
  getMessageHistory() {
    return this.messages;
  }

  // Unregister device
  unregisterDevice(deviceId: string) {
    this.deviceConnections.delete(deviceId);
    console.log(`Device ${deviceId} unregistered from message sync`);
  }
}

export default DemoMessageSync;
