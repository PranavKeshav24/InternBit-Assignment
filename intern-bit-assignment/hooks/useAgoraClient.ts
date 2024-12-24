"use client";

import { useState, useEffect, useCallback } from "react";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { AGORA_APP_ID, DEFAULT_CHANNEL, TEMP_TOKEN } from "@/app/config";

export function useAgoraClient() {
  const [client] = useState<IAgoraRTCClient>(() => 
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      await client.subscribe(user, mediaType);
      
      if (mediaType === "video") {
        setUsers(prevUsers => {
          if (prevUsers.find(u => u.uid === user.uid)) return prevUsers;
          // Play the video immediately after subscribing
          user.videoTrack?.play(`remote-video-${user.uid}`);
          return [...prevUsers, user];
        });
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "video") {
        user.videoTrack?.stop();
      }
      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }
      client.unsubscribe(user);
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      user.videoTrack?.stop();
      user.audioTrack?.stop();
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      users.forEach(user => {
        user.videoTrack?.stop();
        user.audioTrack?.stop();
      });
      client.removeAllListeners();
      if (isConnected) {
        client.leave();
        setIsConnected(false);
      }
    };
  }, [client, isConnected]);

  const joinChannel = useCallback(async () => {
    if (isConnected) {
      console.log("Already connected to channel");
      return true;
    }

    try {
      await client.join(AGORA_APP_ID, DEFAULT_CHANNEL, TEMP_TOKEN);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error("Error joining channel:", error);
      return false;
    }
  }, [client, isConnected]);

  return { client, users, joinChannel, isConnected };
}