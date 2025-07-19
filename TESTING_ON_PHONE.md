# Testing OfflineChatX on Your Phone

## What You Can Test RIGHT NOW (Single Device)

### 1. Open OfflineChatX App
- Look for the app icon on your phone
- Grant all permissions when prompted

### 2. Debug Mode Testing
- App will simulate finding 3 nearby devices
- Tap any device to "connect"
- Send messages and receive auto-replies
- Test UI components and message flow

### 3. UI Features to Verify
- ✅ WhatsApp-style chat bubbles
- ✅ Message timestamps
- ✅ Encryption indicators (🔒)
- ✅ Connection status banner
- ✅ Device discovery list
- ✅ Send/receive message animations

## For Real BLE Testing (Need 2 Phones)
1. Install APK on second device
2. Turn off debug mode in code
3. Both devices will find each other
4. Test real P2P encrypted messaging

## Troubleshooting
- **App won't open**: Check Android version (needs 6.0+)
- **No permissions popup**: Go to Settings > Apps > OfflineChatX > Permissions
- **App crashes**: Check device logs with: `adb -s L7P7JREY75KNYLGY logcat`
