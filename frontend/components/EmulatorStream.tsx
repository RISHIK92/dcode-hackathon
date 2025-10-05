"use client";

import React, { useEffect, useRef, useState } from "react";

// You will need to install this library: npm install simple-peer
// Simple-peer abstracts away a lot of the WebRTC boilerplate.
import Peer from "simple-peer";

const SIGNALING_URL = "ws://localhost:3001"; // Your backend's WebSocket URL

interface EmulatorStreamProps {
  projectId: string;
  authToken: string; // We need the JWT to authenticate API calls
}

export const EmulatorStream: React.FC<EmulatorStreamProps> = ({
  projectId,
  authToken,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Requesting session...");

  useEffect(() => {
    if (!projectId || !authToken) return;

    let peer: Peer.Instance | null = null;
    let ws: WebSocket | null = null;

    const startSession = async () => {
      try {
        // 1. Call the backend to spin up the container
        const response = await fetch(
          `http://localhost:4000/api/sessions/${projectId}/run`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to start session on the backend.");
        }

        const data = await response.json();
        console.log("Session started:", data);
        setStatus("Connecting to stream...");

        // 2. Connect to the signaling server
        ws = new WebSocket(SIGNALING_URL);
        console.log(ws, "WebSocket instance");

        ws.onopen = () => {
          console.log("Connected to signaling server");
          ws?.send(
            JSON.stringify({ type: "join", role: "browser", projectId })
          );

          // 3. Create the WebRTC peer connection
          peer = new Peer({ initiator: true, trickle: false });

          peer.on("signal", (offer: any) => {
            // Send the offer to the bridge via the signaling server
            ws?.send(
              JSON.stringify({ type: "offer", sdp: offer.sdp, projectId })
            );
          });

          peer.on("stream", (stream) => {
            // We got the video stream!
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setStatus("Connected");
          });

          peer.on("connect", () => {
            console.log("Data channel connected!");
          });

          peer.on("data", (data) => {
            // Handle incoming data from bridge (e.g., logs)
            console.log("Received log:", data.toString());
          });

          peer.on("error", (err) => setStatus(`Error: ${err.message}`));
          peer.on("close", () => setStatus("Disconnected"));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "answer") {
            peer?.signal({ type: "answer", sdp: data.sdp });
          }
        };
      } catch (error) {
        console.error("Session Error:", error);
        setStatus("Failed to start session.");
      }
    };

    startSession();

    return () => {
      ws?.close();
      peer?.destroy();
    };
  }, [projectId, authToken]);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center">
      {status !== "Connected" && (
        <div className="absolute text-white text-center">
          <p>{status}</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full transition-opacity ${
          status === "Connected" ? "opacity-100" : "opacity-0"
        }`}
        // We will add interaction handlers here later
      />
    </div>
  );
};
