import { useState } from "react";
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  Music2,
  X,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { useUserPlaylists, useCreatePlaylist } from "../hooks/useQueries";
import type { PlaylistView } from "../backend.d";

type View =
  | "home"
  | "search"
  | "library"
  | "liked"
  | { type: "playlist"; id: bigint };

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onUpload: () => void;
}

function viewKey(view: View): string {
  if (typeof view === "string") return view;
  return `playlist-${view.id}`;
}

export default function Sidebar({ currentView, onNavigate, onUpload }: SidebarProps) {
  const { data: playlists = [], isLoading } = useUserPlaylists();
  const createPlaylist = useCreatePlaylist();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const isActive = (view: View) => viewKey(view) === viewKey(currentView);

  const handleCreatePlaylist = async () => {
    const name = newName.trim();
    if (!name) return;
    await createPlaylist.mutateAsync(name);
    setNewName("");
    setCreating(false);
  };

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-[oklch(0.05_0_0)] h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <img
          src="/assets/generated/soundwave-logo-transparent.dim_200x200.png"
          alt="SoundWave"
          className="w-8 h-8 object-contain"
        />
        <span className="font-display text-xl font-bold text-white tracking-tight">
          SoundWave
        </span>
      </div>

      {/* Main Nav */}
      <nav className="px-3 mb-4">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className={`nav-item flex items-center gap-4 w-full px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive("home")
              ? "text-white"
              : "text-[oklch(0.6_0_0)] hover:text-white"
          }`}
        >
          <Home
            size={22}
            className={
              isActive("home") ? "text-white" : "text-[oklch(0.6_0_0)]"
            }
            fill={isActive("home") ? "white" : "transparent"}
          />
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate("search")}
          className={`nav-item flex items-center gap-4 w-full px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive("search")
              ? "text-white"
              : "text-[oklch(0.6_0_0)] hover:text-white"
          }`}
        >
          <Search
            size={22}
            className={
              isActive("search") ? "text-white" : "text-[oklch(0.6_0_0)]"
            }
          />
          Search
        </button>
        <button
          type="button"
          onClick={() => onNavigate("library")}
          className={`nav-item flex items-center gap-4 w-full px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive("library")
              ? "text-white"
              : "text-[oklch(0.6_0_0)] hover:text-white"
          }`}
        >
          <Library
            size={22}
            className={
              isActive("library") ? "text-white" : "text-[oklch(0.6_0_0)]"
            }
          />
          Your Library
        </button>
        <button
          type="button"
          onClick={onUpload}
          className="nav-item flex items-center gap-4 w-full px-3 py-2.5 text-sm font-medium text-[oklch(0.6_0_0)] hover:text-sw-green transition-colors"
        >
          <CloudUpload
            size={22}
            className="text-[oklch(0.6_0_0)] group-hover:text-sw-green"
          />
          Upload Song
        </button>
      </nav>

      {/* Divider */}
      <div className="h-px bg-[oklch(0.2_0_0)] mx-3 mb-4" />

      {/* Library Section */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* Liked Songs */}
        <button
          type="button"
          onClick={() => onNavigate("liked")}
          className={`nav-item flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1 ${
            isActive("liked")
              ? "text-white bg-[oklch(0.14_0_0)]"
              : "text-[oklch(0.6_0_0)] hover:text-white hover:bg-[oklch(0.12_0_0)]"
          }`}
        >
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-gradient-to-br from-[oklch(0.45_0.15_280)] to-[oklch(0.7_0_0)]">
            <Heart size={14} className="text-white" fill="white" />
          </div>
          <span className="truncate">Liked Songs</span>
        </button>

        {/* Create Playlist button */}
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="nav-item flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-[oklch(0.6_0_0)] hover:text-white hover:bg-[oklch(0.12_0_0)] transition-colors mb-3"
        >
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-[oklch(0.25_0_0)]">
            <Plus size={16} className="text-white" />
          </div>
          <span>Create Playlist</span>
        </button>

        {/* New playlist input */}
        {creating && (
          <div className="mb-3 px-1">
            <div className="flex items-center gap-2 bg-[oklch(0.14_0_0)] rounded-md px-2 py-1">
              <input
                type="text"
                placeholder="Playlist name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreatePlaylist();
                  if (e.key === "Escape") {
                    setCreating(false);
                    setNewName("");
                  }
                }}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[oklch(0.4_0_0)] outline-none py-1"
              />
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                }}
                className="text-[oklch(0.5_0_0)] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void handleCreatePlaylist()}
              disabled={!newName.trim() || createPlaylist.isPending}
              className="mt-1 w-full text-xs bg-sw-green text-black font-semibold py-1.5 rounded-md hover:bg-sw-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createPlaylist.isPending ? (
                <Loader2 size={12} className="animate-spin mx-auto" />
              ) : (
                "Create"
              )}
            </button>
          </div>
        )}

        {/* Playlists */}
        {isLoading ? (
          <div className="space-y-2 px-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 bg-[oklch(0.14_0_0)] rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {playlists.map((pl: PlaylistView) => (
              <button
                key={pl.id.toString()}
                type="button"
                onClick={() => onNavigate({ type: "playlist", id: pl.id })}
                className={`nav-item flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive({ type: "playlist", id: pl.id })
                    ? "text-white bg-[oklch(0.14_0_0)]"
                    : "text-[oklch(0.6_0_0)] hover:text-white hover:bg-[oklch(0.12_0_0)]"
                }`}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-[oklch(0.18_0_0)]">
                  <Music2 size={14} className="text-[oklch(0.55_0_0)]" />
                </div>
                <span className="truncate">{pl.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
