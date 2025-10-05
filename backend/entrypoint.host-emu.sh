#!/bin/bash
set -e

HOST_IP="host.docker.internal"
ADB_PORT=5037

# Cleanup function for graceful shutdown
cleanup() {
    echo "Shutting down gracefully..."
    pkill -P $$ 2>/dev/null || true
    if [ -n "$DEVICE_SERIAL" ] && [ -f /usr/local/bin/adb-host ]; then
        /usr/local/bin/adb-host -s ${DEVICE_SERIAL} reverse --remove-all 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGTERM SIGINT EXIT

echo "===== ADB Connection Setup ====="

# Kill any local ADB server to prevent conflicts
echo "Killing any local ADB server..."
killall adb 2>/dev/null || true
sleep 2

# Wait for host ADB server to be reachable
echo "Waiting for host ADB server at ${HOST_IP}:${ADB_PORT}..."
RETRY_COUNT=0
MAX_RETRIES=30

while ! nc -z ${HOST_IP} ${ADB_PORT} 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "ERROR: Could not connect to host ADB server after ${MAX_RETRIES} attempts"
        echo "Make sure ADB server is running on macOS with:"
        echo "  adb -a -P 5037 server nodaemon &"
        exit 1
    fi
    echo "Attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

echo "✓ Host ADB server is reachable!"

# Create a custom ADB wrapper to always use host server
echo "Creating ADB wrapper script..."
cat > /usr/local/bin/adb-host << 'EOFADB'
#!/bin/bash
exec /usr/bin/adb -H host.docker.internal -P 5037 "$@"
EOFADB
chmod +x /usr/local/bin/adb-host

# Wait for device
echo "Waiting for device to be available..."
/usr/local/bin/adb-host wait-for-device

# Get device serial with better error handling
DEVICE_SERIAL=$(/usr/local/bin/adb-host devices | grep -v "List" | grep -E "device$|emulator" | head -n1 | awk '{print $1}')

if [ -z "$DEVICE_SERIAL" ]; then
    echo "ERROR: No device found connected to host ADB server"
    echo "Available devices:"
    /usr/local/bin/adb-host devices
    exit 1
fi

echo "✓ Connected to device: ${DEVICE_SERIAL}"

# Verify device is responsive
echo "Verifying device connectivity..."
if ! /usr/local/bin/adb-host -s ${DEVICE_SERIAL} shell echo "test" > /dev/null 2>&1; then
    echo "ERROR: Device ${DEVICE_SERIAL} is not responsive"
    exit 1
fi
echo "✓ Device is responsive"

# Setup port forwarding
echo "Setting up port reverse for Metro bundler..."
/usr/local/bin/adb-host -s ${DEVICE_SERIAL} reverse tcp:8081 tcp:8081
echo "✓ Port 8081 reversed successfully"

# Export device serial for use by other processes
export DEVICE_SERIAL

echo ""
echo "===== Starting Services ====="

# Start WebRTC Bridge
echo "Starting WebRTC Bridge..."
cd /app/webrtc-bridge
node index.js > /tmp/bridge.log 2>&1 &
BRIDGE_PID=$!
cd /app

sleep 3

if ! kill -0 $BRIDGE_PID 2>/dev/null; then
    echo "ERROR: WebRTC bridge failed to start"
    echo "Bridge log:"
    cat /tmp/bridge.log
    exit 1
fi
echo "✓ WebRTC Bridge started (PID: $BRIDGE_PID)"

# Start Expo Metro Bundler
echo "Starting Expo Metro Bundler..."
npx expo start --port 8081 --dev-client --clear > /tmp/expo.log 2>&1 &
EXPO_PID=$!

sleep 5

if ! kill -0 $EXPO_PID 2>/dev/null; then
    echo "ERROR: Expo Metro bundler failed to start"
    echo "Expo log:"
    cat /tmp/expo.log
    exit 1
fi
echo "✓ Expo Metro Bundler started (PID: $EXPO_PID)"

# Give Metro time to fully initialize
echo "Waiting for Metro to initialize..."
sleep 10

echo ""
echo "===== Starting Screen Capture ====="

# Start Xvfb for headless display
echo "Starting virtual display (Xvfb)..."
Xvfb :1 -screen 0 1280x720x24 &
XVFB_PID=$!
export DISPLAY=:1

sleep 3

if ! kill -0 $XVFB_PID 2>/dev/null; then
    echo "ERROR: Xvfb failed to start"
    exit 1
fi
echo "✓ Xvfb started (PID: $XVFB_PID)"

# Start screen streaming with retry logic
echo "Starting scrcpy screen capture..."
RETRY_COUNT=0
MAX_STREAM_RETRIES=3

while [ $RETRY_COUNT -lt $MAX_STREAM_RETRIES ]; do
    echo "Stream attempt $((RETRY_COUNT + 1))/$MAX_STREAM_RETRIES..."
    
    # Use the adb-host wrapper for scrcpy by setting ADB environment
    export ADB=/usr/local/bin/adb-host
    
    # Use mkv format for better pipe stability
    scrcpy \
        -s ${DEVICE_SERIAL} \
        --video-codec=h264 \
        --max-size=1280 \
        --max-fps=30 \
        --bit-rate=2M \
        --no-audio \
        --no-control \
        --video-buffer=50 \
        --display-buffer=0 \
        --record=- \
        --record-format=mkv 2>/tmp/scrcpy.log \
    | ffmpeg \
        -fflags nobuffer \
        -flags low_delay \
        -i pipe:0 \
        -c:v libvpx \
        -quality realtime \
        -cpu-used 8 \
        -deadline realtime \
        -b:v 1M \
        -f rtp \
        rtp://127.0.0.1:5004 2>/tmp/ffmpeg.log
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "Stream ended normally"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    if [ $RETRY_COUNT -lt $MAX_STREAM_RETRIES ]; then
        echo "Stream failed with exit code ${EXIT_CODE}"
        echo ""
        echo "=== Last 20 lines of scrcpy log ==="
        tail -20 /tmp/scrcpy.log 2>/dev/null || echo "No scrcpy log available"
        echo ""
        echo "=== Last 20 lines of ffmpeg log ==="
        tail -20 /tmp/ffmpeg.log 2>/dev/null || echo "No ffmpeg log available"
        echo ""
        echo "Retrying in 5 seconds..."
        sleep 5
    else
        echo "ERROR: Stream failed after ${MAX_STREAM_RETRIES} attempts"
        echo ""
        echo "=== Full scrcpy log ==="
        cat /tmp/scrcpy.log 2>/dev/null || echo "No scrcpy log available"
        echo ""
        echo "=== Full ffmpeg log ==="
        cat /tmp/ffmpeg.log 2>/dev/null || echo "No ffmpeg log available"
        exit 1
    fi
done

echo "Container shutting down..."