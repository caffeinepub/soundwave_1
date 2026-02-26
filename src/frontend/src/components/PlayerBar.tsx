import { useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
} from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import { useIsSongLiked, useLikeSong, useUnlikeSong } from "../hooks/useQueries";
import { formatTime, getCoverGradient } from "../utils/music";

function EqBars() {
  return (
    <div className="flex items-end gap-[2px] h-4 shrink-0">
      <span className="eq-bar w-[3px]" />
      <span className="eq-bar w-[3px]" />
      <span className="eq-bar w-[3px]" />
      <span className="eq-bar w-[3px]" />
    </div>
  );
}

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seekTo,
    setVolume,
    playNext,
    playPrev,
  } = usePlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const { data: liked = false } = useIsSongLiked(
    currentSong?.id ?? BigInt(0)
  );
  const likeSong = useLikeSong();
  const unlikeSong = useUnlikeSong();

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(duration, ratio * duration)));
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = volumeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, ratio)));
  };

  const handleLike = () => {
    if (!currentSong) return;
    if (liked) {
      unlikeSong.mutate(currentSong.id);
    } else {
      likeSong.mutate(currentSong.id);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const coverStyle = currentSong?.coverUrl
    ? undefined
    : { background: getCoverGradient(currentSong?.id ?? 0) };

  return (
    <footer className="glass-player h-[88px] flex items-center px-4 gap-4 shrink-0 shadow-player">
      {/* Left: Current Song */}
      <div className="flex items-center gap-3 w-56 shrink-0">
        {currentSong ? (
          <>
            <div
              className="w-14 h-14 rounded shrink-0 overflow-hidden"
              style={coverStyle}
            >
              {currentSong.coverUrl && (
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.album}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    if (t.parentElement) {
                      t.parentElement.style.background = getCoverGradient(
                        currentSong.id
                      );
                    }
                  }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isPlaying && <EqBars />}
                <p className="text-sm font-medium text-white truncate">
                  {currentSong.title}
                </p>
              </div>
              <p className="text-xs text-[oklch(0.55_0_0)] truncate">
                {currentSong.artist}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLike}
              className={`shrink-0 transition-colors ${
                liked
                  ? "text-sw-green"
                  : "text-[oklch(0.55_0_0)] hover:text-white"
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
            </button>
          </>
        ) : (
          <div className="text-[oklch(0.4_0_0)] text-sm">No song selected</div>
        )}
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xl">
        {/* Playback buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={playPrev}
            disabled={!currentSong}
            className="text-[oklch(0.65_0_0)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition-transform"
          >
            {isPlaying ? (
              <Pause size={16} fill="black" className="text-black" />
            ) : (
              <Play size={16} fill="black" className="text-black ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            disabled={!currentSong}
            className="text-[oklch(0.65_0_0)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-[oklch(0.55_0_0)] w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressRef}
            className="progress-track flex-1"
            onClick={handleProgressClick}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seekTo(Math.min(duration, currentTime + 5));
              if (e.key === "ArrowLeft") seekTo(Math.max(0, currentTime - 5));
            }}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <div className="progress-thumb" />
            </div>
          </div>
          <span className="text-xs text-[oklch(0.55_0_0)] w-10 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="flex items-center gap-2 w-36 justify-end shrink-0">
        <button
          type="button"
          onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
          className="text-[oklch(0.65_0_0)] hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div
          ref={volumeRef}
          className="volume-track flex-1"
          onClick={handleVolumeClick}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setVolume(Math.min(1, volume + 0.05));
            if (e.key === "ArrowLeft") setVolume(Math.max(0, volume - 0.05));
          }}
          role="slider"
          tabIndex={0}
          aria-label="Volume"
          aria-valuenow={Math.round(volumePercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="volume-fill" style={{ width: `${volumePercent}%` }} />
        </div>
      </div>
    </footer>
  );
}
