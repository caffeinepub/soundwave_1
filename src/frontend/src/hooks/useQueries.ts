import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { Principal } from "@icp-sdk/core/principal";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import type { Song, PlaylistView } from "../backend.d";

function useCallerPrincipal(): Principal {
  const { identity } = useInternetIdentity();
  return identity?.getPrincipal() ?? Principal.anonymous();
}

export function useAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchSongs(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      // Search both title and artist, then merge + deduplicate
      const [byTitle, byArtist] = await Promise.all([
        actor.searchSongsByTitle(term),
        actor.searchSongsByArtist(term),
      ]);
      const seen = new Set<string>();
      const merged: Song[] = [];
      for (const song of [...byTitle, ...byArtist]) {
        const key = song.id.toString();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(song);
        }
      }
      return merged;
    },
    enabled: !!actor && !isFetching && term.trim().length > 0,
  });
}

export function useSongsByGenre(genre: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "genre", genre],
    queryFn: async () => {
      if (!actor || !genre) return [];
      return actor.filterSongsByGenre(genre);
    },
    enabled: !!actor && !isFetching && !!genre,
  });
}

export function useLikedSongs() {
  const { actor, isFetching } = useActor();
  const principal = useCallerPrincipal();
  return useQuery<Song[]>({
    queryKey: ["liked-songs", principal.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLikedSongs(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsSongLiked(songId: bigint) {
  const { actor, isFetching } = useActor();
  const principal = useCallerPrincipal();
  return useQuery<boolean>({
    queryKey: ["liked", principal.toString(), songId.toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isSongLiked(principal, songId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikeSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.likeSong(songId);
    },
    onSuccess: (_, songId) => {
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      queryClient.invalidateQueries({
        queryKey: ["liked-songs", principal.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["liked", principal.toString(), songId.toString()],
      });
    },
  });
}

export function useUnlikeSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.unlikeSong(songId);
    },
    onSuccess: (_, songId) => {
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      queryClient.invalidateQueries({
        queryKey: ["liked-songs", principal.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["liked", principal.toString(), songId.toString()],
      });
    },
  });
}

export function useUserPlaylists() {
  const { actor, isFetching } = useActor();
  const principal = useCallerPrincipal();
  return useQuery<PlaylistView[]>({
    queryKey: ["playlists", principal.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserPlaylists(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaylistSongs(playlistId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["playlist-songs", playlistId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlaylistSongs(playlistId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createPlaylist(name);
    },
    onSuccess: () => {
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      queryClient.invalidateQueries({
        queryKey: ["playlists", principal.toString()],
      });
    },
  });
}

export function useDeletePlaylist() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playlistId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePlaylist(playlistId);
    },
    onSuccess: () => {
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      queryClient.invalidateQueries({
        queryKey: ["playlists", principal.toString()],
      });
    },
  });
}

export function useAddSongToPlaylist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      songId,
    }: {
      playlistId: bigint;
      songId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSongToPlaylist(playlistId, songId);
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: ["playlist-songs", playlistId.toString()],
      });
    },
  });
}

export function useRemoveSongFromPlaylist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      songId,
    }: {
      playlistId: bigint;
      songId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeSongFromPlaylist(playlistId, songId);
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: ["playlist-songs", playlistId.toString()],
      });
    },
  });
}

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });
    audio.src = url;
  });
}

export interface UploadSongParams {
  title: string;
  artist: string;
  album: string;
  genre: string;
  audioFile: File;
  coverFile?: File | null;
  onProgress?: (pct: number) => void;
}

export function useUploadSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      artist,
      album,
      genre,
      audioFile,
      coverFile,
      onProgress,
    }: UploadSongParams) => {
      if (!actor) throw new Error("No actor");

      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      // Get audio duration
      const durationSecs = await getAudioDuration(audioFile);

      // Upload audio file
      let audioProgress = 0;
      let coverProgress = 0;

      const updateProgress = () => {
        const total = coverFile ? audioProgress * 0.7 + coverProgress * 0.3 : audioProgress;
        onProgress?.(Math.round(total));
      };

      const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
      const { hash: audioHash } = await storageClient.putFile(audioBytes, (pct) => {
        audioProgress = pct;
        updateProgress();
      });
      const audioUrl = await storageClient.getDirectURL(audioHash);

      // Upload cover image (if provided)
      let coverUrl = "";
      if (coverFile) {
        const coverBytes = new Uint8Array(await coverFile.arrayBuffer());
        const { hash: coverHash } = await storageClient.putFile(coverBytes, (pct) => {
          coverProgress = pct;
          updateProgress();
        });
        coverUrl = await storageClient.getDirectURL(coverHash);
      }

      onProgress?.(100);

      const songId = await actor.uploadSong(
        title,
        artist,
        album,
        genre,
        BigInt(durationSecs),
        audioUrl,
        coverUrl,
      );

      return songId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}
