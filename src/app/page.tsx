"use client";
import { useRef } from "react";
import { LandingComponent } from "@/component/landing/landing";

const MUSIC_SRC = "/st_ms.mp3";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="flex-1 flex h-full flex-col items-center justify-center">
      {MUSIC_SRC ? (
        <audio
          ref={audioRef}
          src={MUSIC_SRC}
          loop
          preload="none"
          className="hidden"
          onError={() => {}}
        />
      ) : null}
      <LandingComponent onPlayMusic={handlePlayMusic} />
    </div>
  );
}
