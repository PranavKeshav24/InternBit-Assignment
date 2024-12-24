"use client";

import { useState, useCallback } from "react";
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack } from "agora-rtc-sdk-ng";

export function useScreenShare(client: IAgoraRTCClient) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);

  const startScreenShare = useCallback(async () => {
    try {
      // Create a screen sharing track (local video track)
      const track = await AgoraRTC.createScreenVideoTrack(
        {
          encoderConfig: "1080p_1",
          optimizationMode: "detail",
        },
        "disable" // "disable" indicates we do not want audio for the screen share
      );

      // Publish the track to the Agora channel
      await client.publish(track);

      // Play the local screen share track (display it on the client)
      track.play("local-video");

      // Update the state to store the screen sharing track and status
      setScreenTrack(track);
      setIsScreenSharing(true);

      // Handle when the user stops screen sharing (via browser UI)
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
      // Unpublish and stop the screen track
      await client.unpublish(screenTrack);
      screenTrack.close();

      // Clear the state
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
    stopScreenShare,
  };
}
