# Bluetooth Chat App - MVP 1

🔵 **Peer-to-Peer Offline Chat via Bluetooth**

## Features Implemented

✅ **Core Functionality**
- Bluetooth Low Energy (BLE) device discovery
- Peer-to-peer connection establishment
- Real-time message exchange
- WhatsApp-style chat interface
- Offline capability (no internet/SIM required)

✅ **User Interface**
- Device discovery screen with scanning functionality
- Chat screen with message bubbles
- Connection status indicators
- Modern, intuitive design

✅ **Technical Implementation**
- React Native with TypeScript
- BLE communication using react-native-ble-plx
- Navigation between screens
- Proper permission handling
- Error handling and user feedback

## How to Run

### Prerequisites
- Node.js 18+
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Installation
```bash
# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Running the App

#### Android
```bash
# Start Metro bundler
npm start

# In another terminal, run Android app
npm run android
```

#### iOS (macOS only)
```bash
# Start Metro bundler
npm start

# In another terminal, run iOS app
npm run ios
```

## Usage Instructions

### Step 1: Device Discovery
1. Open the app on two devices
2. Ensure Bluetooth is enabled on both devices
3. Grant location permissions when prompted
4. Tap "Start Scanning" to discover nearby devices

### Step 2: Connection
1. Device A should appear in Device B's scan results
2. Tap on the device name to connect
3. Connection will be established automatically

### Step 3: Chat
1. Once connected, you'll see the chat screen
2. Type messages and tap "Send"
3. Messages will appear in real-time on both devices
4. Connection status is shown in the header

## Technical Architecture

### Core Components
- **BLEService**: Manages Bluetooth operations
- **DeviceListScreen**: Handles device discovery and connection
- **ChatScreen**: Manages message display and input
- **Navigation**: React Navigation for screen flow

### BLE Implementation
- **Service UUID**: Custom chat service for device identification
- **Characteristic UUID**: Message exchange channel
- **Data Format**: JSON messages encoded in base64
- **Connection**: One device acts as peripheral, other as central

### Message Protocol
```typescript
interface ChatMessage {
  id: string;
  text: string;
  timestamp: number;
  sender: 'me' | 'other';
  deviceName?: string;
}
```

## Key Features

### 🔒 **Offline Operation**
- No internet or cellular connection required
- Direct device-to-device communication
- Works in remote areas without network coverage

### 📱 **Cross-Platform**
- Supports both Android and iOS
- Consistent user experience
- Native performance

### 🔵 **Bluetooth Low Energy**
- Energy efficient communication
- Automatic connection management
- Proper permission handling

### 💬 **Real-time Messaging**
- Instant message delivery
- Message timestamps
- Sender identification
- WhatsApp-style interface

## Limitations (MVP 1)

- **1-to-1 Chat Only**: No group chat support yet
- **Limited Range**: Bluetooth range (typically 10-30 meters)
- **No Message History**: Messages are lost when app closes
- **No File Sharing**: Text messages only
- **Single Connection**: Can only connect to one device at a time

## Future Enhancements (Next MVPs)

- **Multi-device mesh networking**
- **File sharing capabilities**
- **Message persistence**
- **Group chat support**
- **User profiles and avatars**
- **Message encryption**
- **Voice messages**

## Troubleshooting

### Common Issues

1. **Bluetooth Not Working**
   - Ensure Bluetooth is enabled
   - Grant location permissions
   - Restart the app

2. **Can't Find Devices**
   - Both devices should be scanning
   - Check device proximity
   - Restart Bluetooth

3. **Connection Failed**
   - Try scanning again
   - Restart both apps
   - Check permissions

4. **Messages Not Sending**
   - Verify connection status
   - Check Bluetooth connection
   - Restart the chat

### Permissions Required

#### Android
- `BLUETOOTH`
- `BLUETOOTH_ADMIN`
- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `BLUETOOTH_ADVERTISE`
- `ACCESS_FINE_LOCATION`

#### iOS
- `NSBluetoothAlwaysUsageDescription`
- `NSBluetoothPeripheralUsageDescription`

## Contributing

This is an MVP implementation. Future contributions should focus on:
1. Adding mesh networking capabilities
2. Implementing message persistence
3. Adding file sharing features
4. Improving connection reliability
5. Adding encryption and security features

## License

MIT License - Feel free to use and modify for your projects.

---

**🔵 Offline Chat via Bluetooth - Connecting people without the internet!**
