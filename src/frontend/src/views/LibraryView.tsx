import { Library, Music2 } from "lucide-react";
import { useLikedSongs, useUserPlaylists } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoverGradient } from "../utils/music";

type View =
  | "home"
  | "search"
  | "library"
  | "liked"
  | { type: "playlist"; id: bigint };

interface LibraryViewProps {
  onNavigate: (view: View) => void;
}

export default function LibraryView({ onNavigate }: LibraryViewProps) {
  const { data: liked = [], isLoading: likedLoading } = useLikedSongs();
  const { data: playlists = [], isLoading: playlistsLoading } =
    useUserPlaylists();

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="font-display text-3xl font-bold text-white mb-6 fade-in-up">
        Your Library
      </h1>

      {/* Liked Songs card */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-white mb-4">
          Collections
        </h2>
        <button
          type="button"
          onClick={() => onNavigate("liked")}
          className="music-card flex items-center gap-4 w-full bg-[oklch(0.12_0_0)] rounded-lg px-4 py-4 text-left max-w-sm"
        >
          <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-[oklch(0.45_0.15_280)] to-[oklch(0.65_0_0)]">
            <span className="text-2xl text-white">♥</span>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Liked Songs</p>
            <p className="text-sm text-[oklch(0.55_0_0)]">
              {likedLoading ? (
                <Skeleton className="h-3 w-16 bg-[oklch(0.2_0_0)]" />
              ) : (
                `${liked.length} ${liked.length === 1 ? "song" : "songs"}`
              )}
            </p>
          </div>
        </button>
      </section>

      {/* Playlists */}
      <section>
        <h2 className="font-display text-xl font-bold text-white mb-4">
          Playlists
        </h2>

        {playlistsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => `sk-${i}`).map((key) => (
              <div key={key} className="bg-[oklch(0.12_0_0)] rounded-lg p-4">
                <Skeleton className="w-full aspect-square rounded-md mb-4 bg-[oklch(0.18_0_0)]" />
                <Skeleton className="h-4 w-3/4 mb-2 bg-[oklch(0.18_0_0)]" />
                <Skeleton className="h-3 w-1/2 bg-[oklch(0.15_0_0)]" />
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16 text-[oklch(0.5_0_0)]">
            <Library size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-white mb-2">
              No playlists yet
            </p>
            <p className="text-sm">
              Create a playlist in the sidebar to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <button
                key={pl.id.toString()}
                type="button"
                onClick={() =>
                  onNavigate({ type: "playlist", id: pl.id })
                }
                className="music-card bg-[oklch(0.12_0_0)] rounded-lg p-4 text-left group relative"
              >
                {/* Cover placeholder */}
                <div
                  className="w-full aspect-square rounded-md mb-4 flex items-center justify-center"
                  style={{
                    background: getCoverGradient(pl.id),
                  }}
                >
                  <Music2 size={32} className="text-white opacity-60" />
                </div>

                {/* Play overlay */}
                <div className="play-overlay absolute bottom-[4.5rem] right-6">
                  <div className="w-10 h-10 rounded-full bg-sw-green flex items-center justify-center shadow-lg">
                    <span className="ml-0.5 text-black text-sm">▶</span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white truncate mb-1">
                  {pl.name}
                </p>
                <p className="text-xs text-[oklch(0.55_0_0)]">
                  {pl.songIds.length} {pl.songIds.length === 1 ? "song" : "songs"}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[oklch(0.2_0_0)] text-center">
        <p className="text-xs text-[oklch(0.4_0_0)]">
          © 2026. Built with ♥ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sw-green transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
