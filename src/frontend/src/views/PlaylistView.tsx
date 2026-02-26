import { useState } from "react";
import { Music2, Trash2 } from "lucide-react";
import { usePlaylistSongs, useUserPlaylists, useDeletePlaylist } from "../hooks/useQueries";
import SongRow from "../components/SongRow";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayer } from "../contexts/PlayerContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PlaylistViewProps {
  playlistId: bigint;
  onBack: () => void;
}

export default function PlaylistView({ playlistId, onBack }: PlaylistViewProps) {
  const { data: songs = [], isLoading: songsLoading } = usePlaylistSongs(playlistId);
  const { data: playlists = [] } = useUserPlaylists();
  const deletePlaylist = useDeletePlaylist();
  const { playSong } = usePlayer();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const playlist = playlists.find((p) => p.id === playlistId);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleDelete = async () => {
    await deletePlaylist.mutateAsync(playlistId);
    onBack();
  };

  const gradients = [
    "from-[oklch(0.5_0.18_155)] to-[oklch(0.15_0_0)]",
    "from-[oklch(0.45_0.18_230)] to-[oklch(0.15_0_0)]",
    "from-[oklch(0.5_0.2_300)] to-[oklch(0.15_0_0)]",
    "from-[oklch(0.5_0.18_30)] to-[oklch(0.15_0_0)]",
  ];
  const gradient = gradients[Number(playlistId) % gradients.length];

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div
        className={`px-6 pt-12 pb-6 bg-gradient-to-b ${gradient}`}
      >
        <div className="flex items-end gap-6">
          <div className="w-40 h-40 rounded-lg flex items-center justify-center shrink-0 bg-[oklch(0.25_0_0)] shadow-2xl">
            <Music2 size={60} className="text-[oklch(0.55_0_0)]" />
          </div>
          <div className="pb-2 flex-1">
            <p className="text-xs font-medium text-white uppercase tracking-widest mb-2">
              Playlist
            </p>
            <h1 className="font-display text-4xl font-bold text-white mb-3 truncate">
              {playlist?.name ?? "Playlist"}
            </h1>
            <p className="text-sm text-[oklch(0.75_0_0)]">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          {songs.length > 0 && (
            <button
              type="button"
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full bg-sw-green flex items-center justify-center hover:scale-105 hover:bg-sw-green-hover transition-all shadow-lg"
            >
              <span className="ml-1 text-black text-2xl">▶</span>
            </button>
          )}

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="text-[oklch(0.55_0_0)] hover:text-destructive transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[oklch(0.14_0_0)] border-[oklch(0.28_0_0)] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete Playlist
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[oklch(0.6_0_0)]">
                  Are you sure you want to delete "{playlist?.name}"? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[oklch(0.2_0_0)] text-white border-[oklch(0.3_0_0)] hover:bg-[oklch(0.25_0_0)]">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void handleDelete()}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {songsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
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
            <Music2 size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium text-white mb-2">
              This playlist is empty
            </p>
            <p className="text-sm">
              Add songs from any song list using the "⋯" menu
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
    </main>
  );
}
