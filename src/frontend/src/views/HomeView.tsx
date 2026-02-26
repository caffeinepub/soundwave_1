import { Skeleton } from "@/components/ui/skeleton";
import SongCard from "../components/SongCard";
import { useAllSongs } from "../hooks/useQueries";
import { getGreeting, getGenreGradient } from "../utils/music";
import type { Song } from "../backend.d";

interface HomeViewProps {
  onSelectGenre: (genre: string) => void;
}

function getSongGenres(songs: Song[]): string[] {
  const genres = new Set<string>();
  songs.forEach((s) => {
    if (s.genre) genres.add(s.genre);
  });
  return Array.from(genres).slice(0, 12);
}

export default function HomeView({ onSelectGenre }: HomeViewProps) {
  const { data: songs = [], isLoading } = useAllSongs();
  const genres = getSongGenres(songs);
  const featured = songs.slice(0, 10);

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 pb-4">
      {/* Greeting */}
      <h1 className="font-display text-3xl font-bold text-white mb-6 fade-in-up">
        {getGreeting()}
      </h1>

      {/* Featured Songs */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-white mb-4 fade-in-up fade-in-up-delay-1">
          Featured Songs
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => `sk-${i}`).map((key) => (
              <div key={key} className="bg-[oklch(0.12_0_0)] rounded-lg p-4">
                <Skeleton className="w-full aspect-square rounded-md mb-4 bg-[oklch(0.18_0_0)]" />
                <Skeleton className="h-4 w-3/4 mb-2 bg-[oklch(0.18_0_0)]" />
                <Skeleton className="h-3 w-1/2 bg-[oklch(0.15_0_0)]" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-[oklch(0.5_0_0)]">
            <p className="text-lg font-medium mb-2">No songs available</p>
            <p className="text-sm">Check back later for new music</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 fade-in-up fade-in-up-delay-2">
            {featured.map((song) => (
              <SongCard key={song.id.toString()} song={song} queue={songs} />
            ))}
          </div>
        )}
      </section>

      {/* Genres */}
      {!isLoading && genres.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-white mb-4 fade-in-up fade-in-up-delay-3">
            Browse by Genre
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 fade-in-up fade-in-up-delay-4">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => onSelectGenre(genre)}
                className="genre-card relative rounded-lg overflow-hidden h-24 text-left px-4 py-3"
                style={{ background: getGenreGradient(genre) }}
              >
                <span className="font-display text-base font-bold text-white capitalize drop-shadow-md">
                  {genre}
                </span>
                <div className="absolute right-3 bottom-3 opacity-30 text-5xl select-none pointer-events-none">
                  ♪
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All Songs */}
      {!isLoading && songs.length > featured.length && (
        <section>
          <h2 className="font-display text-xl font-bold text-white mb-4">
            All Songs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {songs.slice(10).map((song) => (
              <SongCard key={song.id.toString()} song={song} queue={songs} />
            ))}
          </div>
        </section>
      )}

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
