# Start with a stable base image
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC
ENV ADB_VENDOR_KEYS=/root/.android
ENV ANDROID_ADB_SERVER_PORT=5037

# Install essential dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    gnupg \
    curl \
    wget \
    android-tools-adb \
    scrcpy \
    ffmpeg \
    watchman \
    xvfb \
    netcat \
    procps \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js v18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Expo CLI globally
RUN npm install -g expo-cli

# Set working directory
WORKDIR /app

# Copy template project
COPY template-project/ /app/

# Install dependencies
RUN npm install

# Copy WebRTC bridge
COPY webrtc-bridge/ /app/webrtc-bridge/
RUN cd /app/webrtc-bridge && npm install

# Copy entrypoint script
COPY entrypoint.host-emu.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create .android directory for ADB keys
RUN mkdir -p /root/.android

# Expose ports
EXPOSE 8081
EXPOSE 5004/udp

ENTRYPOINT ["/entrypoint.sh"]