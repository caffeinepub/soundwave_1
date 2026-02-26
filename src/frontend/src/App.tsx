import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PlayerProvider } from "./contexts/PlayerContext";
import Sidebar from "./components/Sidebar";
import PlayerBar from "./components/PlayerBar";
import UploadModal from "./components/UploadModal";
import HomeView from "./views/HomeView";
import SearchView from "./views/SearchView";
import LibraryView from "./views/LibraryView";
import LikedSongsView from "./views/LikedSongsView";
import PlaylistView from "./views/PlaylistView";

type View =
  | "home"
  | "search"
  | "library"
  | "liked"
  | { type: "playlist"; id: bigint };

interface SearchState {
  genre?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [searchState, setSearchState] = useState<SearchState>({});
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (typeof view !== "string" || view !== "search") {
      setSearchState({});
    }
  };

  const handleSelectGenre = (genre: string) => {
    setSearchState({ genre });
    setCurrentView("search");
  };

  const renderView = () => {
    if (typeof currentView === "object" && currentView.type === "playlist") {
      return (
        <PlaylistView
          playlistId={currentView.id}
          onBack={() => handleNavigate("library")}
        />
      );
    }

    switch (currentView) {
      case "home":
        return <HomeView onSelectGenre={handleSelectGenre} />;
      case "search":
        return (
          <SearchView
            initialGenre={searchState.genre}
            onClearGenre={() => setSearchState({})}
          />
        );
      case "library":
        return <LibraryView onNavigate={handleNavigate} />;
      case "liked":
        return <LikedSongsView />;
      default:
        return <HomeView onSelectGenre={handleSelectGenre} />;
    }
  };

  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        {/* Main layout: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onUpload={() => setUploadOpen(true)}
          />

          {/* Content area with gradient background */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-[oklch(0.2_0_0)] to-[oklch(0.08_0_0)] relative">
            {renderView()}
          </div>
        </div>

        {/* Player bar — always visible, persists between views */}
        <PlayerBar />
      </div>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <Toaster />
    </PlayerProvider>
  );
}
