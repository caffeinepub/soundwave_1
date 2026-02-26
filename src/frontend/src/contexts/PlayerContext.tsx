import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import type { Song } from "../backend.d";

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  playNext: () => void;
  playPrev: () => void;
  setQueue: (songs: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      // Auto-advance to next
      setQueue((prevQueue) => {
        setCurrentSong((prevSong) => {
          if (!prevSong || prevQueue.length === 0) return prevSong;
          const idx = prevQueue.findIndex((s) => s.id === prevSong.id);
          if (idx < prevQueue.length - 1) {
            const nextSong = prevQueue[idx + 1];
            audio.src = nextSong.audioUrl;
            audio.load();
            audio.play().catch(() => {});
            setIsPlaying(true);
            return nextSong;
          }
          return prevSong;
        });
        return prevQueue;
      });
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  const playSong = useCallback((song: Song, songQueue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (songQueue) setQueue(songQueue);

    setCurrentSong(song);
    audio.src = song.audioUrl;
    audio.load();
    audio.play().catch(() => {});
    setIsPlaying(true);
    setCurrentTime(0);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = vol;
    setVolumeState(vol);
  }, []);

  const playNext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    if (idx < queue.length - 1) {
      const next = queue[idx + 1];
      setCurrentSong(next);
      audio.src = next.audioUrl;
      audio.load();
      audio.play().catch(() => {});
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [currentSong, queue]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    // If more than 3 seconds in, restart current; else go previous
    if (currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
    } else if (idx > 0) {
      const prev = queue[idx - 1];
      setCurrentSong(prev);
      audio.src = prev.audioUrl;
      audio.load();
      audio.play().catch(() => {});
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [currentSong, queue, currentTime]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        playSong,
        togglePlay,
        seekTo,
        setVolume,
        playNext,
        playPrev,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
