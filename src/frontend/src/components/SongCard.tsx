import { Play } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import { getCoverGradient } from "../utils/music";
import type { Song } from "../backend.d";

interface SongCardProps {
  song: Song;
  queue: Song[];
}

export default function SongCard({ song, queue }: SongCardProps) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  const coverStyle = song.coverUrl
    ? undefined
    : { background: getCoverGradient(song.id) };

  return (
    <div className="music-card bg-[oklch(0.12_0_0)] rounded-lg p-4 cursor-pointer relative group">
      {/* Cover Art */}
      <div
        className="w-full aspect-square rounded-md mb-4 overflow-hidden relative"
        style={coverStyle}
      >
        {song.coverUrl && (
          <img
            src={song.coverUrl}
            alt={song.album}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              if (target.parentElement) {
                target.parentElement.style.background = getCoverGradient(
                  song.id
                );
              }
            }}
          />
        )}

        {/* Play button overlay */}
        <button
          type="button"
          className="play-overlay absolute bottom-2 right-2 w-10 h-10 rounded-full bg-sw-green flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          onClick={handlePlay}
        >
          {isCurrentSong && isPlaying ? (
            <span className="w-3 h-3 flex gap-0.5">
              <span className="w-1 h-full bg-black rounded-sm" />
              <span className="w-1 h-full bg-black rounded-sm" />
            </span>
          ) : (
            <Play size={18} fill="black" className="text-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <button
        type="button"
        onClick={handlePlay}
        className="text-left w-full"
      >
        <p
          className={`text-sm font-semibold truncate mb-1 ${
            isCurrentSong ? "text-sw-green" : "text-white"
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-[oklch(0.55_0_0)] truncate">{song.artist}</p>
      </button>
    </div>
  );
}
