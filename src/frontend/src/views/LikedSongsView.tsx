import { Heart, Music } from "lucide-react";
import { useLikedSongs } from "../hooks/useQueries";
import SongRow from "../components/SongRow";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayer } from "../contexts/PlayerContext";

export default function LikedSongsView() {
  const { data: songs = [], isLoading } = useLikedSongs();
  const { playSong } = usePlayer();

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero gradient header */}
      <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-[oklch(0.35_0.15_280)] to-[oklch(0.12_0_0)]">
        <div className="flex items-end gap-6">
          <div className="w-40 h-40 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-[oklch(0.5_0.2_280)] to-[oklch(0.3_0.1_280)] shadow-2xl">
            <Heart size={60} className="text-white" fill="white" />
          </div>
          <div className="pb-2">
            <p className="text-xs font-medium text-white uppercase tracking-widest mb-2">
              Playlist
            </p>
            <h1 className="font-display text-5xl font-bold text-white mb-3">
              Liked Songs
            </h1>
            <p className="text-sm text-[oklch(0.75_0_0)]">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Play button */}
        {songs.length > 0 && (
          <button
            type="button"
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-sw-green flex items-center justify-center mb-6 hover:scale-105 hover:bg-sw-green-hover transition-all shadow-lg"
          >
            <span className="ml-1 text-black text-2xl">▶</span>
          </button>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
              <div key={key} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="w-8 h-4 bg-[oklch(0.18_0_0)]" />
                <Skeleton className="w-10 h-10 rounded bg-[oklch(0.18_0_0)]" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3 mb-1 bg-[oklch(0.18_0_0)]" />
                  <Skeleton className="h-3 w-1/4 bg-[oklch(0.15_0_0)]" />
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 text-[oklch(0.5_0_0)]">
            <Heart size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium text-white mb-2">
              Songs you like will appear here
            </p>
            <p className="text-sm">
              Save songs by tapping the heart icon.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-[oklch(0.45_0_0)] uppercase tracking-widest border-b border-[oklch(0.2_0_0)] mb-2">
              <span className="w-8 text-center">#</span>
              <span className="w-10" />
              <span className="flex-1">Title</span>
              <span className="w-40 hidden md:block">Album</span>
              <span className="w-28 text-right">Duration</span>
            </div>
            <div>
              {songs.map((song, idx) => (
                <SongRow
                  key={song.id.toString()}
                  song={song}
                  index={idx}
                  queue={songs}
                  showAlbum
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 px-6 pb-6 text-center">
        <div className="flex items-center gap-2 text-[oklch(0.4_0_0)] justify-center">
          <Music size={14} />
          <p className="text-xs">
            Your personal music collection
          </p>
        </div>
      </footer>
    </main>
  );
}
