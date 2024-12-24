"use client";

import { useState, useCallback } from "react";
import AgoraRTC, { IAgoraRTCClient, IScreenVideoTrack } from "agora-rtc-sdk-ng";

export function useScreenShare(client: IAgoraRTCClient) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<IScreenVideoTrack | null>(null);

  const startScreenShare = useCallback(async () => {
    try {
      const track = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
        optimizationMode: "detail",
      }, "disable");

      await client.publish(track);
      track.play("local-video");
      
      setScreenTrack(track);
      setIsScreenSharing(true);
      
      // Handle when user ends sharing via browser UI
      track.on("track-ended", () => {
        stopScreenShare();
      });

      return track;
    } catch (error) {
      if ((error as any).code === "PERMISSION_DENIED") {
        console.warn("Screen sharing permission denied by user");
      } else {
        console.error("Failed to start screen sharing:", error);
      }
      return null;
    }
  }, [client]);

  const stopScreenShare = useCallback(async () => {
    if (!screenTrack) return;

    try {
      await client.unpublish(screenTrack);
      screenTrack.close();
      setScreenTrack(null);
      setIsScreenSharing(false);
    } catch (error) {
      console.error("Failed to stop screen sharing:", error);
    }
  }, [client, screenTrack]);

  return {
    isScreenSharing,
    screenTrack,
    startScreenShare,
    stopScreenShare
  };
}