"use client";

import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  recordingUrl: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AudioPlayer({ recordingUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }

  function handleDownload() {
    window.open(recordingUrl, "_blank");
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)] flex flex-col gap-6">
      <audio ref={audioRef} src={recordingUrl} preload="metadata" />
      <div className="flex items-center gap-6">
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[32px]">
            {playing ? "pause" : "play_arrow"}
          </span>
        </button>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="relative w-full h-2 bg-surface-container-highest rounded-full overflow-hidden cursor-pointer"
            onClick={handleScrub}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="hidden sm:flex gap-4">
          <button
            onClick={handleDownload}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
