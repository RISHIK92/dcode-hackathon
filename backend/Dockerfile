# Stage 1: Base Image with Core Dependencies
# We use Ubuntu 22.04 as a stable, widely-supported base.
FROM ubuntu:22.04

# Set environment variables to prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

# Set up Android SDK environment variables
ENV ANDROID_HOME="/opt/android-sdk"
ENV ANDROID_SDK_ROOT="${ANDROID_HOME}"
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/emulator"

# Install essential dependencies:
# - openjdk-11-jdk: Required for Android development
# - wget, unzip, curl: Utilities for downloading files
# - libnss3, libgconf-2-4: For Node/NPM
# - watchman: File watcher used by Metro bundler for better performance
# - scrcpy, ffmpeg: For screen capturing and streaming
# - adb: Android Debug Bridge (installed later via SDK)
# - qemu-kvm: For hardware-accelerated emulation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-11-jdk \
    wget \
    unzip \
    curl \
    libnss3 \
    libgconf-2-4 \
    watchman \
    scrcpy \
    ffmpeg \
    qemu-kvm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js (e.g., v18) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Expo CLI globally
RUN npm install -g expo-cli

# Stage 2: Install Android SDK and Emulator
# Download and install the Android SDK command-line tools
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /tmp/cmdline-tools.zip && \
    mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    unzip /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# Accept SDK licenses automatically
RUN yes | sdkmanager --licenses

# Install required SDK packages:
# - platform-tools: Contains `adb`
# - emulator: The Android emulator itself
# - system-images;android-30;google_apis;x86_64: The system image for the virtual device.
#   API 30 is a stable choice. google_apis includes Google services. x86_64 is for performance.
RUN sdkmanager "platform-tools" "emulator" "system-images;android-30;google_apis;x86_64"

# Create an Android Virtual Device (AVD)
# The `echo "no"` pipes a "no" to the prompt asking to create a custom hardware profile.
RUN echo "no" | avdmanager create avd \
    --name "emulator-avd" \
    --package "system-images;android-30;google_apis;x86_64" \
    --device "pixel_3a" \
    --force

# Stage 3: Set up the Application Workspace
# Set the working directory inside the container
WORKDIR /app
COPY webrtc-bridge/ /app/webrtc-bridge/
RUN cd /app/webrtc-bridge && npm install

# Copy a template Expo project into the container.
# This provides the base `package.json`, `app.json`, etc.
# The user's code will later be mounted over `/app/src`.
COPY template-project/ /app/

# Install the template project's dependencies
RUN npm install

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# The entrypoint script will start all necessary services
ENTRYPOINT ["/entrypoint.sh"]