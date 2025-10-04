#!/bin/bash
set -e

echo "Starting Android Emulator..."
# Start the emulator in the background with no window, audio, or boot animation for speed.
# -gpu swiftshader_indirect is a software renderer, which is more reliable in containerized environments.
emulator -avd emulator-avd -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect &

echo "Waiting for emulator to be fully booted..."
# Wait not just for the device to be online, but for the boot process to complete.
adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done;'

echo "Emulator booted successfully!"

# Reverse the Metro bundler port so the app inside the emulator can connect to it.
adb reverse tcp:8081 tcp:8081

echo "Starting WebRTC Bridge..."
# Run the bridge in the background. It needs the PROJECT_ID to identify itself.
node /app/webrtc-bridge/index.js &

echo "Starting Expo Metro Bundler..."
# Start the bundler in the background. It will watch for file changes in the mounted volume.
# The `src` directory is where the user's code is mounted.
# We clear the cache to ensure it picks up the mounted code.
npx expo start --port 8081 --dev-client --clear &

# Give Metro a moment to start up
sleep 15

echo "Starting screen streaming with scrcpy..."
# Start scrcpy to stream the screen over TCP.
# The WebRTC service will connect to this TCP port (5555) to grab the video stream.
# --stay-awake keeps the device from sleeping.
# This command runs in the foreground, keeping the container alive.
scrcpy \
    --tcp=0.0.0.0:5555 \
    --stay-awake \
    --no-audio \
    --bit-rate 2M \
    --max-fps 15