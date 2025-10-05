const { RTCPeerConnection } = require("werift");
const { exec, spawn } = require("child_process");
const WebSocket = require("ws");
const dgram = require("dgram");

// Use environment variable for host resolution
const HOST_IP = "host.docker.internal";
const ADB_PORT = 5037;

// Set ADB_SERVER_SOCKET to use host's ADB server
process.env.ADB_SERVER_SOCKET = `tcp:${HOST_IP}:${ADB_PORT}`;

const SIGNALING_SERVER_URL =
  process.env.SIGNALING_SERVER_URL || `ws://${HOST_IP}:3001`;
const PROJECT_ID = process.env.PROJECT_ID;

console.log(`[Bridge] Starting for project: ${PROJECT_ID}`);
console.log(`[Bridge] Connecting to signaling server: ${SIGNALING_SERVER_URL}`);
console.log(`[Bridge] Using ADB server at: ${HOST_IP}:${ADB_PORT}`);

const ws = new WebSocket(SIGNALING_SERVER_URL);
let pc;
let dataChannel;
let rtpSocket;

ws.on("open", () => {
  console.log("[Bridge] Connected to signaling server");
  ws.send(
    JSON.stringify({ type: "join", role: "bridge", projectId: PROJECT_ID })
  );
});

ws.on("error", (error) => {
  console.error("[Bridge] WebSocket error:", error);
});

ws.on("close", () => {
  console.log("[Bridge] Disconnected from signaling server");
  cleanup();
});

ws.on("message", async (message) => {
  try {
    const data = JSON.parse(message);
    console.log("[Bridge] Received message:", data.type);

    switch (data.type) {
      case "offer":
        await handleOffer(data.sdp);
        break;
      case "candidate":
        if (pc && data.candidate) {
          await pc.addIceCandidate(data.candidate);
        }
        break;
    }
  } catch (error) {
    console.error("[Bridge] Error handling message:", error);
  }
});

async function handleOffer(offerSdp) {
  try {
    console.log("[Bridge] Creating peer connection...");

    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        ws.send(
          JSON.stringify({
            type: "candidate",
            candidate,
            projectId: PROJECT_ID,
          })
        );
      }
    };

    // Add video transceiver
    const transceiver = pc.addTransceiver("video", { direction: "sendonly" });
    console.log("[Bridge] Video transceiver added");

    // Create data channel for input events
    dataChannel = pc.createDataChannel("input");
    dataChannel.onopen = () => {
      console.log("[Bridge] Data channel opened");
    };
    dataChannel.onmessage = handleDataChannelMessage;
    dataChannel.onerror = (error) => {
      console.error("[Bridge] Data channel error:", error);
    };

    await pc.setRemoteDescription({ type: "offer", sdp: offerSdp });
    console.log("[Bridge] Remote description set");

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log("[Bridge] Local description set");

    ws.send(
      JSON.stringify({
        type: "answer",
        sdp: answer.sdp,
        projectId: PROJECT_ID,
      })
    );

    console.log("[Bridge] Answer sent to signaling server");

    // Setup RTP listener for video stream
    setupRTPListener();
  } catch (error) {
    console.error("[Bridge] Error handling offer:", error);
  }
}

function setupRTPListener() {
  console.log("[Bridge] Setting up RTP listener on port 5004...");

  rtpSocket = dgram.createSocket("udp4");

  rtpSocket.on("message", (msg, rinfo) => {
    // Forward RTP packets to WebRTC peer connection
    // Note: This is a simplified version. In production, you'd need proper
    // RTP parsing and forwarding to the video track
    console.log(`[Bridge] Received RTP packet: ${msg.length} bytes`);
  });

  rtpSocket.on("error", (err) => {
    console.error("[Bridge] RTP socket error:", err);
  });

  rtpSocket.bind(5004, () => {
    console.log("[Bridge] RTP listener ready on UDP port 5004");
  });
}

function handleDataChannelMessage(event) {
  try {
    const command = JSON.parse(event.data);
    console.log("[Bridge] Received command:", command.type);

    // Use the adb-host wrapper that connects to the macOS ADB server
    const deviceSerial = process.env.DEVICE_SERIAL;
    const adbCmd = deviceSerial
      ? `/usr/local/bin/adb-host -s ${deviceSerial}`
      : "/usr/local/bin/adb-host";

    switch (command.type) {
      case "tap":
        exec(`${adbCmd} shell input tap ${command.x} ${command.y}`, (error) => {
          if (error) {
            console.error("[Bridge] Tap command error:", error);
          }
        });
        break;

      case "swipe":
        const duration = command.duration || 150;
        exec(
          `${adbCmd} shell input swipe ${command.x1} ${command.y1} ${command.x2} ${command.y2} ${duration}`,
          (error) => {
            if (error) {
              console.error("[Bridge] Swipe command error:", error);
            }
          }
        );
        break;

      case "key":
        exec(`${adbCmd} shell input keyevent ${command.keyCode}`, (error) => {
          if (error) {
            console.error("[Bridge] Key command error:", error);
          }
        });
        break;

      case "text":
        // Escape special characters for shell
        const text = command.text.replace(/[^\w\s]/g, "\\$&");
        exec(`${adbCmd} shell input text "${text}"`, (error) => {
          if (error) {
            console.error("[Bridge] Text command error:", error);
          }
        });
        break;

      default:
        console.warn("[Bridge] Unknown command type:", command.type);
    }
  } catch (error) {
    console.error("[Bridge] Error handling data channel message:", error);
  }
}

function cleanup() {
  console.log("[Bridge] Cleaning up...");

  if (rtpSocket) {
    rtpSocket.close();
  }

  if (dataChannel) {
    dataChannel.close();
  }

  if (pc) {
    pc.close();
  }

  if (ws) {
    ws.close();
  }
}

// Handle process termination
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("uncaughtException", (error) => {
  console.error("[Bridge] Uncaught exception:", error);
  cleanup();
  process.exit(1);
});
