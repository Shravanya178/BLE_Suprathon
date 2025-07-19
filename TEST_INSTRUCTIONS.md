# OfflineChatX Testing Instructions

## Pre-Testing Setup
1. **Install on 2 devices**: Install `app-debug.apk` on two Android devices
2. **Enable Developer Options**: Go to Settings > About Phone > Tap "Build Number" 7 times
3. **Enable USB Debugging**: Settings > Developer Options > USB Debugging (ON)

## Testing Steps

### Device 1 (Host/Server)
1. Open OfflineChatX app
2. Grant all permissions (Bluetooth, Location, Nearby Devices)
3. The app will automatically start advertising as "OfflineChatX_Device_[ID]"
4. Wait for "Ready to connect" status

### Device 2 (Client)
1. Open OfflineChatX app on second device
2. Grant all permissions
3. App will start scanning for nearby devices
4. Look for "OfflineChatX_Device_[ID]" in the device list
5. Tap to connect

### Test Chat Features
1. **Send Messages**: Type and send messages from both devices
2. **Verify Encryption**: Look for 🔒 lock icon next to messages
3. **Test Timestamps**: Verify message timestamps are displayed
4. **Connection Status**: Check the status banner shows "Connected via Bluetooth"
5. **Auto-reconnect**: Turn Bluetooth OFF/ON on one device to test reconnection

### Test Scenarios
- ✅ Send text messages in both directions
- ✅ Send multiple rapid messages
- ✅ Test with devices moving apart (range testing)
- ✅ Test reconnection after connection loss
- ✅ Verify messages persist after app restart

## Expected Behavior
- Messages appear as WhatsApp-style bubbles
- Sent messages (blue/right), Received messages (gray/left)
- All messages show timestamps
- Connection status banner updates in real-time
- Auto-reconnect works within 30 seconds
- Messages are encrypted with AES-256

## Troubleshooting
- **No devices found**: Ensure both devices have Location/Bluetooth enabled
- **Connection fails**: Try restarting Bluetooth on both devices
- **No messages**: Check permission grants and try reconnecting
- **App crashes**: Check Android version compatibility (minimum API level)
