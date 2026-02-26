import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Song {
    id: bigint;
    title: string;
    duration: bigint;
    album: string;
    audioUrl: string;
    genre: string;
    artist: string;
    coverUrl: string;
}
export interface PlaylistView {
    id: bigint;
    owner: Principal;
    name: string;
    songIds: Array<bigint>;
}
export interface backendInterface {
    addSongToPlaylist(playlistId: bigint, songId: bigint): Promise<boolean>;
    createPlaylist(name: string): Promise<bigint>;
    deletePlaylist(playlistId: bigint): Promise<boolean>;
    deleteSong(songId: bigint): Promise<boolean>;
    filterSongsByGenre(genre: string): Promise<Array<Song>>;
    getAllPlaylists(): Promise<Array<PlaylistView>>;
    getAllSongs(): Promise<Array<Song>>;
    getLikedSongs(user: Principal): Promise<Array<Song>>;
    getPlaylistSongs(playlistId: bigint): Promise<Array<Song>>;
    getUserPlaylists(user: Principal): Promise<Array<PlaylistView>>;
    isSongLiked(user: Principal, songId: bigint): Promise<boolean>;
    likeSong(songId: bigint): Promise<boolean>;
    removeSongFromPlaylist(playlistId: bigint, songId: bigint): Promise<boolean>;
    searchSongsByArtist(searchTerm: string): Promise<Array<Song>>;
    searchSongsByTitle(searchTerm: string): Promise<Array<Song>>;
    unlikeSong(songId: bigint): Promise<boolean>;
    uploadSong(title: string, artist: string, album: string, genre: string, duration: bigint, audioUrl: string, coverUrl: string): Promise<bigint>;
}
