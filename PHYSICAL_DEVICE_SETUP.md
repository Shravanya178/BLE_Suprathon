# Physical Device Setup for OfflineChatX Testing

## Requirements
- **2 Physical Android Devices** (Android 6.0+)
- **USB Cables** for both devices
- **Developer Options** enabled on both devices

## Setup Steps

### Step 1: Enable Developer Options (Both Devices)
1. Go to **Settings > About Phone**
2. Tap **Build Number** 7 times rapidly
3. You'll see "You are now a developer!"
4. Go back to **Settings > Developer Options**
5. Enable **USB Debugging**

### Step 2: Connect and Install APK
1. Connect Device 1 via USB
2. Run: `adb devices` (should show your device)
3. Install: `adb install app/build/outputs/apk/debug/app-debug.apk`
4. Repeat for Device 2

### Step 3: Grant Permissions (Both Devices)
1. Open OfflineChatX app
2. Grant **Location** permissions (Fine & Coarse)
3. Grant **Bluetooth** permissions
4. Grant **Nearby Devices** access
5. Ensure Bluetooth is turned ON

### Step 4: Test P2P Connection
**Device 1 (Host):**
- App automatically starts advertising as "OfflineChatX_Device_[ID]"
- Wait for "Ready to connect" status

**Device 2 (Client):**
- App scans for nearby devices
- Should see "OfflineChatX_Device_[ID]" in device list
- Tap to connect

### Step 5: Test Chat
- Send messages from both devices
- Verify encryption (🔒 lock icon)
- Test auto-reconnect by turning Bluetooth OFF/ON
- Move devices apart to test range (typically 10-30 meters)

## Troubleshooting
- **No devices found**: Check Location & Bluetooth permissions
- **Connection fails**: Restart Bluetooth on both devices
- **App crashes**: Check Android version compatibility
