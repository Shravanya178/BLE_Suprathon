# OfflineChatX - Complete Setup and Usage Guide

## 🚀 Features Implemented

✅ **Core Functionality:**
- Peer-to-peer Bluetooth Low Energy (BLE) communication
- AES-256 message encryption/decryption
- Auto-reconnect functionality
- Message persistence with AsyncStorage
- WhatsApp-style chat interface with timestamps
- Connection status banner with offline mode indicator

✅ **Components Created:**
- `BluetoothService.js` - Complete BLE management with encryption
- `MessageStorage.js` - Local message persistence
- `ChatMessage.js` - WhatsApp-style message bubbles
- `ConnectionStatus.js` - Status banner component
- `DeviceList.js` - Device scanning and selection
- `App.tsx` - Main application with complete UI

✅ **Security:**
- AES-256 encryption for all messages
- Base64 encoding for BLE transmission
- Secure key management (hardcoded for demo, should be dynamic in production)

## 🔧 Setup Instructions

### 1. Prerequisites
```bash
# Ensure you have React Native development environment set up
# Android Studio with SDK
# Android device with Bluetooth LE support
```

### 2. Install Dependencies
```bash
npm install react-native-ble-plx @react-native-community/netinfo buffer crypto-js @react-native-async-storage/async-storage
```

### 3. Permissions
The app automatically requests these permissions:
- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT` 
- `BLUETOOTH_ADVERTISE`
- `ACCESS_FINE_LOCATION`

### 4. Build and Run
```bash
# Android
npx react-native run-android

# iOS (requires macOS)
npx pod-install
npx react-native run-ios
```

## 📱 How to Use

### Device A (Scanner):
1. Open OfflineChatX
2. Tap the connection status banner
3. Tap "Scan" to look for nearby devices
4. Select Device B from the list
5. Wait for connection

### Device B (Peripheral):
1. Open OfflineChatX
2. Keep the app open and visible
3. Wait for Device A to connect

### Chat:
1. Once connected, the status will show "Connected via Bluetooth (Offline Mode)"
2. Type messages in the input field
3. Messages are automatically encrypted and sent
4. Chat history is saved locally
5. Auto-reconnect works if connection drops

## 🔐 Security Features

- **AES-256 Encryption**: All messages are encrypted before transmission
- **Base64 Encoding**: Safe transmission over BLE characteristics
- **Local Storage**: Messages stored securely on device
- **No Internet Required**: Completely offline operation

## 🧪 Testing

### Two Android Devices:
1. Install the app on both devices
2. Enable Bluetooth on both
3. Open the app on both devices
4. One device scans, the other waits
5. Connect and start chatting

### Simulator Testing:
- Use nRF Connect app as a BLE peripheral simulator
- Configure with the UUIDs:
  - Service: `12345678-1234-1234-1234-123456789abc`
  - Characteristic: `87654321-4321-4321-4321-cba987654321`

## ⚡ Performance Optimizations

- **Message Chunking**: Large messages automatically split for BLE
- **Connection Monitoring**: 5-second interval health checks
- **Memory Management**: Efficient FlatList rendering
- **Background Processing**: Non-blocking encryption/decryption

## 🐛 Known Limitations

1. **iOS BLE Peripheral**: react-native-ble-plx has limited peripheral support
2. **Range**: BLE typically works within 10-50 meters
3. **Throughput**: BLE is designed for low-bandwidth communication
4. **Connection Stability**: Depends on device proximity and interference

## 🔮 Future Enhancements

- [ ] Dynamic encryption key exchange
- [ ] Group chat support (mesh networking)
- [ ] File/image sharing
- [ ] Voice messages
- [ ] Contact discovery and pairing
- [ ] Custom device names/avatars
- [ ] Message delivery confirmations
- [ ] Dark mode theme

## 📝 Technical Notes

### UUIDs Used:
- **Service UUID**: `12345678-1234-1234-1234-123456789abc`
- **Characteristic UUID**: `87654321-4321-4321-4321-cba987654321`

### Encryption:
- **Algorithm**: AES-256-CBC
- **Key**: `OfflineChatX2024SecretKey123456789` (hardcoded for demo)
- **Encoding**: Base64 for BLE transmission

### Message Format:
```javascript
{
  id: "timestamp_string",
  text: "message_content",
  sender: "me" | "peer",
  timestamp: "ISO_date_string",
  encrypted: boolean
}
```

## 🚨 Production Considerations

1. **Dynamic Keys**: Implement Diffie-Hellman key exchange
2. **Certificate Pinning**: Add device authentication
3. **Error Handling**: More robust connection error recovery  
4. **Testing**: Comprehensive BLE compatibility testing
5. **Compliance**: Check local Bluetooth regulations

---

**OfflineChatX** - Secure peer-to-peer communication when the internet fails! 📡🔒
