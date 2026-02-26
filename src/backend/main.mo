import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Debug "mo:core/Debug";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    album : Text;
    genre : Text;
    duration : Nat;
    coverUrl : Text;
    audioUrl : Text;
  };

  type Playlist = {
    id : Nat;
    name : Text;
    owner : Principal;
    songIds : List.List<Nat>;
  };

  type PlaylistView = {
    id : Nat;
    name : Text;
    owner : Principal;
    songIds : [Nat];
  };

  // Module for playlist comparison
  module Playlist {
    public func compare(p1 : PlaylistView, p2 : PlaylistView) : { #equal; #less; #greater } {
      Nat.compare(p1.id, p2.id);
    };
  };

  let songs = Map.empty<Nat, Song>();
  let playlists = Map.empty<Nat, Playlist>();
  let userLikedSongs = Map.empty<Principal, Set.Set<Nat>>();

  var nextSongId = 4;
  var nextPlaylistId = 1;

  let demoSongs : [Song] = [
    {
      id = 1;
      title = "Demo Song 1";
      artist = "Demo Artist";
      album = "Demo Album";
      genre = "Rock";
      duration = 300000;
      coverUrl = "https://picsum.photos/200/300";
      audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    },
    {
      id = 2;
      title = "Demo Song 2";
      artist = "Demo Artist";
      album = "Demo Album";
      genre = "Pop";
      duration = 270000;
      coverUrl = "https://picsum.photos/200/300";
      audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
    },
    {
      id = 3;
      title = "Demo Song 3";
      artist = "Demo Artist";
      album = "Demo Album";
      genre = "Jazz";
      duration = 250000;
      coverUrl = "https://picsum.photos/200/300";
      audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
    },
  ];

  public query ({ caller }) func getAllSongs() : async [Song] {
    songs.values().toArray().concat(demoSongs);
  };

  public query ({ caller }) func searchSongsByTitle(searchTerm : Text) : async [Song] {
    let filtered = songs.values().toArray().concat(demoSongs).filter(
      func(song) {
        song.title.toLower().contains(#text(searchTerm.toLower()));
      }
    );
    filtered;
  };

  public query ({ caller }) func searchSongsByArtist(searchTerm : Text) : async [Song] {
    let filtered = songs.values().toArray().concat(demoSongs).filter(
      func(song) {
        song.artist.toLower().contains(#text(searchTerm.toLower()));
      }
    );
    filtered;
  };

  public query ({ caller }) func filterSongsByGenre(genre : Text) : async [Song] {
    let filtered = songs.values().toArray().concat(demoSongs).filter(
      func(song) {
        song.genre.toLower() == genre.toLower();
      }
    );
    filtered;
  };

  public shared ({ caller }) func uploadSong(
    title : Text,
    artist : Text,
    album : Text,
    genre : Text,
    duration : Nat,
    audioUrl : Text,
    coverUrl : Text,
  ) : async Nat {
    let song : Song = {
      id = nextSongId;
      title;
      artist;
      album;
      genre;
      duration;
      audioUrl;
      coverUrl;
    };

    songs.add(nextSongId, song);
    nextSongId += 1;
    song.id;
  };

  public shared ({ caller }) func deleteSong(songId : Nat) : async Bool {
    switch (songs.get(songId)) {
      case (null) { false };
      case (?_) {
        songs.remove(songId);
        true;
      };
    };
  };

  public shared ({ caller }) func createPlaylist(name : Text) : async Nat {
    let playlist : Playlist = {
      id = nextPlaylistId;
      name;
      owner = caller;
      songIds = List.empty<Nat>();
    };

    playlists.add(nextPlaylistId, playlist);
    nextPlaylistId += 1;
    playlist.id;
  };

  public shared ({ caller }) func deletePlaylist(playlistId : Nat) : async Bool {
    switch (playlists.get(playlistId)) {
      case (null) { false };
      case (?playlist) {
        if (playlist.owner != caller) {
          false;
        } else {
          playlists.remove(playlistId);
          true;
        };
      };
    };
  };

  public shared ({ caller }) func addSongToPlaylist(playlistId : Nat, songId : Nat) : async Bool {
    switch (playlists.get(playlistId)) {
      case (null) { false };
      case (?playlist) {
        if (playlist.owner != caller) {
          false;
        } else {
          let songList = playlist.songIds;
          songList.add(songId);
          playlists.add(playlistId, { playlist with songIds = songList });
          true;
        };
      };
    };
  };

  public shared ({ caller }) func removeSongFromPlaylist(playlistId : Nat, songId : Nat) : async Bool {
    switch (playlists.get(playlistId)) {
      case (null) { false };
      case (?playlist) {
        if (playlist.owner != caller) {
          false;
        } else {
          let newSongList = playlist.songIds.filter(func(id) { id != songId });
          playlists.add(
            playlistId,
            { playlist with songIds = newSongList }
          );
          true;
        };
      };
    };
  };

  public query ({ caller }) func getAllPlaylists() : async [PlaylistView] {
    playlists.values().toArray().map(func(p) { { p with songIds = p.songIds.toArray() } });
  };

  public query ({ caller }) func getUserPlaylists(user : Principal) : async [PlaylistView] {
    playlists.values().toArray().filter(
      func(p) { p.owner == user }
    ).map(func(p) { { p with songIds = p.songIds.toArray() } });
  };

  public query ({ caller }) func getPlaylistSongs(playlistId : Nat) : async [Song] {
    switch (playlists.get(playlistId)) {
      case (null) { [] };
      case (?playlist) {
        let userSongs = songs.values().toArray();
        let allSongs = userSongs.concat(demoSongs);
        let songIds = playlist.songIds;
        let resultList = List.empty<Song>();

        songIds.forEach(
          func(songId) {
            switch (allSongs.find(func(song) { song.id == songId })) {
              case (null) {};
              case (?song) { resultList.add(song) };
            };
          }
        );
        resultList.toArray();
      };
    };
  };

  public shared ({ caller }) func likeSong(songId : Nat) : async Bool {
    let currentLikes = switch (userLikedSongs.get(caller)) {
      case (null) {
        let newLikes = Set.empty<Nat>();
        userLikedSongs.add(caller, newLikes);
        newLikes;
      };
      case (?likes) { likes };
    };

    currentLikes.add(songId);
    userLikedSongs.add(caller, currentLikes);
    true;
  };

  public shared ({ caller }) func unlikeSong(songId : Nat) : async Bool {
    switch (userLikedSongs.get(caller)) {
      case (null) { false };
      case (?likes) {
        likes.remove(songId);
        true;
      };
    };
  };

  public query ({ caller }) func getLikedSongs(user : Principal) : async [Song] {
    let currentLikes = switch (userLikedSongs.get(user)) {
      case (null) { Set.empty<Nat>() };
      case (?likes) { likes };
    };

    let userSongs = songs.values().toArray();
    let allSongs = userSongs.concat(demoSongs);
    let resultList = List.empty<Song>();

    currentLikes.toArray().forEach(
      func(songId) {
        switch (allSongs.find(func(song) { song.id == songId })) {
          case (null) {};
          case (?song) { resultList.add(song) };
        };
      }
    );
    resultList.toArray();
  };

  public query ({ caller }) func isSongLiked(user : Principal, songId : Nat) : async Bool {
    switch (userLikedSongs.get(user)) {
      case (null) { false };
      case (?likes) { likes.contains(songId) };
    };
  };
};

