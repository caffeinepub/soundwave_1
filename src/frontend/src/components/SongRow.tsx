import { useState } from "react";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import { useIsSongLiked, useLikeSong, useUnlikeSong, useUserPlaylists, useAddSongToPlaylist } from "../hooks/useQueries";
import { formatDuration } from "../utils/music";
import { getCoverGradient } from "../utils/music";
import type { Song } from "../backend.d";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SongRowProps {
  song: Song;
  index: number;
  queue: Song[];
  showAlbum?: boolean;
}

function EqBars() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      <span className="eq-bar w-[3px]" />
      <span className="eq-bar w-[3px]" />
      <span className="eq-bar w-[3px]" />
      <span className="eq-bar w-[3px]" />
    </div>
  );
}

export default function SongRow({
  song,
  index,
  queue,
  showAlbum = true,
}: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const { data: liked = false } = useIsSongLiked(song.id);
  const likeSong = useLikeSong();
  const unlikeSong = useUnlikeSong();
  const { data: playlists = [] } = useUserPlaylists();
  const addToPlaylist = useAddSongToPlaylist();

  const [hovered, setHovered] = useState(false);

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      unlikeSong.mutate(song.id);
    } else {
      likeSong.mutate(song.id);
    }
  };

  const coverStyle = song.coverUrl
    ? undefined
    : { background: getCoverGradient(song.id) };

  return (
    <button
      type="button"
      className={`song-row group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer w-full text-left ${
        isCurrentSong ? "bg-[oklch(0.18_0_0)]" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
    >
      {/* Track number / play indicator */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {hovered || isCurrentSong ? (
          isCurrentSong && isPlaying && !hovered ? (
            <EqBars />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="text-white hover:scale-110 transition-transform"
            >
              {isCurrentSong && isPlaying ? (
                <Pause size={16} fill="white" />
              ) : (
                <Play size={16} fill="white" />
              )}
            </button>
          )
        ) : (
          <span
            className={`text-sm font-medium ${
              isCurrentSong
                ? "text-sw-green"
                : "text-[oklch(0.55_0_0)]"
            }`}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Cover */}
      <div
        className="w-10 h-10 rounded shrink-0 overflow-hidden"
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
                target.parentElement.style.background = getCoverGradient(song.id);
              }
            }}
          />
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isCurrentSong ? "text-sw-green" : "text-white"
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-[oklch(0.55_0_0)] truncate">{song.artist}</p>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="w-40 hidden md:block">
          <p className="text-sm text-[oklch(0.55_0_0)] truncate">{song.album}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleLike}
          className={`transition-all ${
            liked
              ? "text-sw-green opacity-100"
              : "text-[oklch(0.55_0_0)] opacity-0 group-hover:opacity-100 hover:text-white"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        <span className="text-sm text-[oklch(0.55_0_0)] w-10 text-right">
          {formatDuration(song.duration)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="text-[oklch(0.55_0_0)] opacity-0 group-hover:opacity-100 hover:text-white transition-all"
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[oklch(0.18_0_0)] border-[oklch(0.28_0_0)] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              className="hover:bg-[oklch(0.25_0_0)] cursor-pointer"
              onClick={handleLike}
            >
              {liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            </DropdownMenuItem>
            {playlists.length > 0 && (
              <>
                {playlists.map((pl) => (
                  <DropdownMenuItem
                    key={pl.id.toString()}
                    className="hover:bg-[oklch(0.25_0_0)] cursor-pointer"
                    onClick={() =>
                      addToPlaylist.mutate({
                        playlistId: pl.id,
                        songId: song.id,
                      })
                    }
                  >
                    Add to {pl.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </button>
  );
}
