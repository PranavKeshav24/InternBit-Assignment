"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Camera, CameraOff, Monitor, User } from "lucide-react";
import { useAgoraClient } from "@/hooks/useAgoraClient";
import { useAgoraMedia } from "@/hooks/useAgoraMedia";

export default function VideoCall() {
  const { client, users, joinChannel } = useAgoraClient();
  const {
    isAudioMuted,
    isVideoEnabled,
    isScreenSharing,
    initializeTracks,
    toggleAudio,
    toggleVideo,
    toggleScreenSharing,
  } = useAgoraMedia(client);

  const [userName, setUserName] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userName) return;

    const initializeCall = async () => {
      const joined = await joinChannel();
      if (joined) {
        await initializeTracks();
      }
    };

    initializeCall();
  }, [userName]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowNameDialog(false);
      setUserNames((prev) => ({ ...prev, local: userName }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your name</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              required
            />
            <Button type="submit">Join Call</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <div
            id="local-video"
            className="w-full h-[400px] bg-muted rounded-lg overflow-hidden"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white flex items-center">
            <User className="w-4 h-4 mr-2" />
            {userNames.local || "You"}
          </div>
        </div>
        {users.map((user) => (
          <div key={user.uid} className="relative">
            <div
              id={`remote-video-${user.uid}`}
              className="w-full h-[400px] bg-muted rounded-lg overflow-hidden"
            >
              {user.videoTrack?.play(`remote-video-${user.uid}`)}
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white flex items-center">
              <User className="w-4 h-4 mr-2" />
              {userNames[user.uid] || "User"}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <Button
          variant={isAudioMuted ? "destructive" : "default"}
          size="icon"
          onClick={toggleAudio}
        >
          {isAudioMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          variant={!isVideoEnabled ? "destructive" : "default"}
          size="icon"
          onClick={toggleVideo}
        >
          {!isVideoEnabled ? <CameraOff /> : <Camera />}
        </Button>
        <Button
          variant={isScreenSharing ? "destructive" : "default"}
          size="icon"
          onClick={toggleScreenSharing}
        >
          <Monitor />
        </Button>
      </div>
    </div>
  );
}