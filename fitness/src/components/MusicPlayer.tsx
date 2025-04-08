"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface MusicPlayerProps {
  audioSrc: string; // Path to the audio file
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio(audioSrc));
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  audioRef.current.loop = true; // Loop the music

  const toggleMusic = (): void => {
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Music playback failed:", err));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <Button color="primary" onClick={toggleMusic}>
      {isMusicPlaying ? "Pause Music" : "Play Music"}
    </Button>
  );
};

export default MusicPlayer;