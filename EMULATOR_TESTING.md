# Emulator Testing Workaround (Limited Functionality)

## What You Can Test
- ✅ App UI and navigation
- ✅ Permission requests
- ✅ Bluetooth scanning attempt (will show "Scanning..." state)
- ✅ Mock device list display
- ✅ Message UI components
- ❌ Actual BLE communication between devices
- ❌ Real P2P messaging
- ❌ Connection functionality

## Steps to Test UI Components

### 1. Start Multiple Emulators
```bash
# Terminal 1 - Start first emulator
emulator -avd Medium_Phone_API_35 -port 5554

# Terminal 2 - Start second emulator
emulator -avd Pixel_7_API_35 -port 5556
```

### 2. Install on Both Emulators
```bash
# Install on first emulator
adb -s emulator-5554 install app/build/outputs/apk/debug/app-debug.apk

# Install on second emulator  
adb -s emulator-5556 install app/build/outputs/apk/debug/app-debug.apk
```

### 3. Test App Features
- Open app on both emulators
- Grant all permissions
- Observe UI behavior
- Test input fields and buttons
- Verify permission flows

## Mock Testing Mode
You can add debug features to test without real devices:
- Mock device discovery
- Simulated messages
- UI testing with fake data
