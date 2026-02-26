# SoundWave

## Current State
SoundWave is a Spotify-like music app with:
- A sidebar navigation (Home, Search, Library, Liked Songs, Playlists)
- Pre-loaded demo songs (Summer Breeze, Jazz in the Night, Rock Anthem) stored in backend
- Song playback via a persistent player bar at the bottom
- Search by title/artist and genre filtering
- Like/unlike songs
- Create playlists and add/remove songs
- No audio upload capability -- audioUrl is a static path to /music/*.mp3

## Requested Changes (Diff)

### Add
- Song upload feature: users can upload audio files (MP3, WAV, OGG) from their device
- Upload form with fields: title, artist, album, genre (optional), and cover image (optional)
- Uploaded audio stored via blob-storage component; returned HTTP URL stored as audioUrl in Song record
- Uploaded cover image also stored via blob-storage; returned HTTP URL stored as coverUrl
- A new "Upload" button or section accessible from the sidebar or home view
- Backend: new `uploadSong` function accepting title, artist, album, genre, audioUrl, coverUrl, duration

### Modify
- Backend: add `uploadSong` endpoint so users can add new songs to the library with a real audioUrl from blob-storage
- Frontend: add Upload modal/page reachable from sidebar or prominent button, wire to blob-storage upload + backend uploadSong

### Remove
- Nothing removed

## Implementation Plan
1. Select blob-storage component
2. Regenerate backend with new `uploadSong` function
3. Build frontend Upload modal:
   - Audio file picker (MP3/WAV/OGG), cover image picker (optional)
   - Title, artist, album, genre fields
   - Upload progress indication
   - On submit: upload audio blob -> get URL, upload cover blob -> get URL, call backend uploadSong
   - Show uploaded songs in the library alongside demo songs

## UX Notes
- Upload button should be visible in the sidebar (e.g., "Upload" link) or as a prominent "+" button
- After successful upload, navigate to Home or show a success toast
- Cover image falls back to a placeholder if not provided
- Audio duration can be read from the file metadata (HTMLAudioElement.duration) before submit
