"use client";

import { useState, useEffect, useCallback } from "react";
import AgoraRTC, {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCClient,
} from "agora-rtc-sdk-ng";
import { useScreenShare } from "./useScreenShare";
import { useVolumeControl } from "./useVolumeControl";

export function useAgoraMedia(client: IAgoraRTCClient) {
  const [tracks, setTracks] = useState<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({
    audioTrack: null,
    videoTrack: null,
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localVolume, setLocalVolume] = useState(100);
  
  const { isScreenSharing, startScreenShare, stopScreenShare } = useScreenShare(client);
  const { adjustLocalVolume } = useVolumeControl();

  useEffect(() => {
    return () => {
      tracks.audioTrack?.close();
      tracks.videoTrack?.close();
    };
  }, [tracks]);

  useEffect(() => {
    if (tracks.audioTrack) {
      adjustLocalVolume(tracks.audioTrack, localVolume);
    }
  }, [tracks.audioTrack, localVolume, adjustLocalVolume]);

  const initializeTracks = useCallback(async () => {
    try {
      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard"
        }),
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: "standard"
        })
      ]);

      await client.publish([audioTrack, videoTrack]);
      videoTrack.play("local-video");
      
      setTracks({ audioTrack, videoTrack });
      return true;
    } catch (error) {
      console.error("Error creating tracks:", error);
      return false;
    }
  }, [client]);

  const toggleAudio = useCallback(async () => {
    if (!tracks.audioTrack) return;

    try {
      tracks.audioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  }, [tracks.audioTrack, isAudioMuted]);

  const toggleVideo = useCallback(async () => {
    if (!tracks.videoTrack) return;

    try {
      tracks.videoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  }, [tracks.videoTrack, isVideoEnabled]);

  const toggleScreenSharing = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        if (tracks.videoTrack) {
          await client.unpublish(tracks.videoTrack);
          tracks.videoTrack.stop();
        }
        await startScreenShare();
      } else {
        await stopScreenShare();
        if (tracks.videoTrack) {
          tracks.videoTrack.setEnabled(true);
          await client.publish(tracks.videoTrack);
          tracks.videoTrack.play("local-video");
        }
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  }, [client, tracks.videoTrack, isScreenSharing, startScreenShare, stopScreenShare]);

  const setVolume = useCallback((volume: number) => {
    setLocalVolume(volume);
  }, []);

  return {
    tracks,
    isAudioMuted,
    isVideoEnabled,
    isScreenSharing,
    localVolume,
    initializeTracks,
    toggleAudio,
    toggleVideo,
    toggleScreenSharing,
    setVolume,
  };
}