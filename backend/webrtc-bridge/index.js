const {
  RTCPeerConnection,
  RTCRtpCodecParameters,
  RtpPacket,
} = require("werift");
const { exec } = require("child_process");
const WebSocket = require("ws");
const { spawn } = require("child_process");

const SIGNALING_SERVER_URL =
  process.env.SIGNALING_SERVER_URL || "ws://host.docker.internal:3001";
const PROJECT_ID = process.env.PROJECT_ID; // We'll pass this in when starting the container

console.log(`Bridge starting for project: ${PROJECT_ID}`);
console.log(`Connecting to signaling server: ${SIGNALING_SERVER_URL}`);

const ws = new WebSocket(SIGNALING_SERVER_URL);
let pc;
let videoTrack;
let dataChannel;

ws.on("open", () => {
  console.log("Connected to signaling server.");
  // Identify this bridge to the signaling server
  ws.send(
    JSON.stringify({ type: "join", role: "bridge", projectId: PROJECT_ID })
  );
});

ws.on("message", async (message) => {
  const data = JSON.parse(message);
  console.log("Received message from signaling server:", data.type);

  switch (data.type) {
    case "offer":
      await handleOffer(data.sdp);
      break;
    case "candidate":
      if (pc) {
        await pc.addIceCandidate(data.candidate);
      }
      break;
  }
});

async function handleOffer(offerSdp) {
  pc = new RTCPeerConnection({
    // Public STUN server for NAT traversal
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // Listen for ICE candidates and send them to the browser via the signaling server
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      ws.send(
        JSON.stringify({ type: "candidate", candidate, projectId: PROJECT_ID })
      );
    }
  };

  // Create a video track that we will feed frames into
  videoTrack = pc.addTransceiver("video", "sendonly").sender.track;

  // Create a Data Channel to receive user input
  pc.ondatachannel = (ev) => {
    dataChannel = ev.channel;
    dataChannel.onmessage = handleDataChannelMessage;
  };

  await pc.setRemoteDescription({ type: "offer", sdp: offerSdp });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  ws.send(
    JSON.stringify({ type: "answer", sdp: answer.sdp, projectId: PROJECT_ID })
  );

  // Start piping the scrcpy stream to the video track
  startStreaming();
}

function startStreaming() {
  console.log("Starting ffmpeg to capture scrcpy stream...");
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    "tcp://127.0.0.1:5555", // Input from scrcpy's TCP stream
    "-vcodec",
    "libvpx", // Use VP8 codec for WebRTC
    "-cpu-used",
    "8",
    "-deadline",
    "realtime",
    "-f",
    "rtp", // Output format is RTP
    "udp://127.0.0.1:5004", // Send RTP packets to this local port
  ]);

  // This is a placeholder for a more robust RTP packetizer
  // In a real scenario, you'd use a library to correctly packetize and send RTP
  // This conceptual step is complex; for now, we assume a mechanism pipes RTP to the videoTrack.
  // A full implementation would involve reading from the UDP port and calling videoTrack.write(rtpPacket).
  console.log(
    "Streaming conceptually started. Full RTP handling is required for a production app."
  );
}

function handleDataChannelMessage(event) {
  const command = JSON.parse(event.data);
  console.log("Received command from browser:", command);

  switch (command.type) {
    case "tap":
      exec(`adb shell input tap ${command.x} ${command.y}`);
      break;
    case "swipe":
      exec(
        `adb shell input swipe ${command.x1} ${command.y1} ${command.x2} ${
          command.y2
        } ${command.duration || 150}`
      );
      break;
    case "key":
      exec(`adb shell input keyevent ${command.keyCode}`);
      break;
  }
}
