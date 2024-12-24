"use client";

import { useCallback } from "react";
import type { IMicrophoneAudioTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

export function useVolumeControl() {
  const adjustLocalVolume = useCallback((track: IMicrophoneAudioTrack | null, volume: number) => {
    if (!track) return;
    try {
      // Volume range: 0 to 1000, default 100
      track.setVolume(Math.max(0, Math.min(1000, volume)));
    } catch (error) {
      console.error("Error adjusting local volume:", error);
    }
  }, []);

  const adjustRemoteVolume = useCallback((track: IRemoteAudioTrack | null, volume: number) => {
    if (!track) return;
    try {
      // Volume range: 0 to 100, default 100
      track.setVolume(Math.max(0, Math.min(100, volume)));
    } catch (error) {
      console.error("Error adjusting remote volume:", error);
    }
  }, []);

  return {
    adjustLocalVolume,
    adjustRemoteVolume,
  };
}