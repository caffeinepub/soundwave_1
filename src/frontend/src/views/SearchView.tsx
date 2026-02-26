import { useState, useEffect } from "react";
import { Search, X, Music } from "lucide-react";
import { useAllSongs, useSearchSongs } from "../hooks/useQueries";
import SongRow from "../components/SongRow";
import { Skeleton } from "@/components/ui/skeleton";
import { getGenreGradient } from "../utils/music";
import type { Song } from "../backend.d";

interface SearchViewProps {
  initialGenre?: string;
  onClearGenre?: () => void;
}

function getSongGenres(songs: Song[]): string[] {
  const genres = new Set<string>();
  songs.forEach((s) => {
    if (s.genre) genres.add(s.genre);
  });
  return Array.from(genres);
}

export default function SearchView({
  initialGenre,
  onClearGenre,
}: SearchViewProps) {
  const [query, setQuery] = useState(initialGenre ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const { data: allSongs = [], isLoading: allLoading } = useAllSongs();
  const genres = getSongGenres(allSongs);

  const {
    data: searchResults = [],
    isLoading: searchLoading,
    isFetching,
  } = useSearchSongs(debouncedQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = query.trim().length > 0;
  const results = isSearching ? searchResults : [];
  const isLoading = isSearching && (searchLoading || isFetching);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    onClearGenre?.();
  };

  const handleGenreSearch = (genre: string) => {
    setQuery(genre);
    setDebouncedQuery(genre);
  };

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="font-display text-3xl font-bold text-white mb-6 fade-in-up">
        Search
      </h1>

      {/* Search Input */}
      <div className="relative mb-6 fade-in-up fade-in-up-delay-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(0.45_0_0)] pointer-events-none"
        />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-lg bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] text-white placeholder:text-[oklch(0.45_0_0)] rounded-full py-3 pl-10 pr-10 text-sm outline-none focus:border-white focus:bg-[oklch(0.2_0_0)] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.55_0_0)] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results */}
      {isSearching ? (
        <section>
          <h2 className="font-display text-lg font-bold text-white mb-4">
            {isLoading ? "Searching..." : `Results for "${debouncedQuery}"`}
          </h2>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Skeleton className="w-8 h-4 bg-[oklch(0.18_0_0)]" />
                  <Skeleton className="w-10 h-10 rounded bg-[oklch(0.18_0_0)]" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/3 mb-1 bg-[oklch(0.18_0_0)]" />
                    <Skeleton className="h-3 w-1/4 bg-[oklch(0.15_0_0)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-[oklch(0.5_0_0)]">
              <Music size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">
                Try searching for something else
              </p>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="flex items-center gap-3 px-3 py-2 text-xs text-[oklch(0.45_0_0)] uppercase tracking-widest border-b border-[oklch(0.2_0_0)] mb-2">
                <span className="w-8 text-center">#</span>
                <span className="w-10" />
                <span className="flex-1">Title</span>
                <span className="w-40 hidden md:block">Album</span>
                <span className="w-28 text-right">Duration</span>
              </div>
              <div>
                {results.map((song, idx) => (
                  <SongRow
                    key={song.id.toString()}
                    song={song}
                    index={idx}
                    queue={results}
                    showAlbum
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        /* Browse genres */
        <section className="fade-in-up fade-in-up-delay-2">
          <h2 className="font-display text-lg font-bold text-white mb-4">
            Browse by Genre
          </h2>
          {allLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, i) => `sk-${i}`).map((key) => (
                <Skeleton
                  key={key}
                  className="h-24 rounded-lg bg-[oklch(0.18_0_0)]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreSearch(genre)}
                  className="genre-card relative rounded-lg overflow-hidden h-24 text-left px-4 py-3"
                  style={{ background: getGenreGradient(genre) }}
                >
                  <span className="font-display text-base font-bold text-white capitalize drop-shadow-md">
                    {genre}
                  </span>
                  <div className="absolute right-3 bottom-3 opacity-25 text-5xl select-none pointer-events-none">
                    ♪
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
