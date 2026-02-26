import { useState, useRef } from "react";
import { CloudUpload, Music2, Image, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUploadSong } from "../hooks/useQueries";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

const GENRE_OPTIONS = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "Latin",
  "Metal",
  "Folk",
  "Indie",
  "Reggae",
  "Blues",
  "Soul",
  "Ambient",
];

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [progress, setProgress] = useState(0);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const uploadSong = useUploadSong();

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    // Auto-fill title from filename
    if (!title) {
      const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploadSong.isPending) return;
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAudioFile(null);
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setTitle("");
    setArtist("");
    setAlbum("");
    setGenre("");
    setProgress(0);
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !title.trim() || !artist.trim()) return;

    setProgress(0);

    try {
      await uploadSong.mutateAsync({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        genre: genre.trim(),
        audioFile,
        coverFile,
        onProgress: setProgress,
      });

      toast.success("Song uploaded successfully!");
      resetForm();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
      setProgress(0);
    }
  };

  const isValid = !!audioFile && title.trim().length > 0 && artist.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[oklch(0.1_0_0)] border-[oklch(0.22_0_0)] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-white flex items-center gap-2">
            <CloudUpload size={20} className="text-sw-green" />
            Upload Song
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 mt-1">
          {/* Audio File Picker */}
          <div>
            <Label className="text-sm font-medium text-[oklch(0.75_0_0)] mb-1.5 block">
              Audio File <span className="text-sw-green">*</span>
            </Label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="hidden"
              id="audio-upload"
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-sm ${
                audioFile
                  ? "border-sw-green bg-[oklch(0.14_0.02_160)] text-sw-green"
                  : "border-[oklch(0.25_0_0)] bg-[oklch(0.14_0_0)] text-[oklch(0.55_0_0)] hover:border-[oklch(0.4_0_0)] hover:text-white"
              }`}
            >
              <Music2 size={18} className="shrink-0" />
              <span className="truncate">
                {audioFile ? audioFile.name : "Choose audio file (MP3, WAV, OGG...)"}
              </span>
              {audioFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioFile(null);
                    if (audioInputRef.current) audioInputRef.current.value = "";
                  }}
                  className="ml-auto shrink-0 text-[oklch(0.5_0_0)] hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </button>
          </div>

          {/* Cover Image Picker */}
          <div>
            <Label className="text-sm font-medium text-[oklch(0.75_0_0)] mb-1.5 block">
              Cover Image <span className="text-[oklch(0.45_0_0)] text-xs">(optional)</span>
            </Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              id="cover-upload"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-sm ${
                  coverFile
                    ? "border-[oklch(0.4_0_0)] bg-[oklch(0.14_0_0)] text-white"
                    : "border-[oklch(0.25_0_0)] bg-[oklch(0.14_0_0)] text-[oklch(0.55_0_0)] hover:border-[oklch(0.4_0_0)] hover:text-white"
                }`}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                ) : (
                  <Image size={18} className="shrink-0" />
                )}
                <span className="truncate">
                  {coverFile ? coverFile.name : "Choose cover image"}
                </span>
              </button>
              {coverFile && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="shrink-0 text-[oklch(0.5_0_0)] hover:text-white p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label
              htmlFor="song-title"
              className="text-sm font-medium text-[oklch(0.75_0_0)] mb-1.5 block"
            >
              Title <span className="text-sw-green">*</span>
            </Label>
            <Input
              id="song-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              className="bg-[oklch(0.14_0_0)] border-[oklch(0.25_0_0)] text-white placeholder:text-[oklch(0.4_0_0)] focus:border-[oklch(0.5_0_0)]"
              required
            />
          </div>

          {/* Artist */}
          <div>
            <Label
              htmlFor="song-artist"
              className="text-sm font-medium text-[oklch(0.75_0_0)] mb-1.5 block"
            >
              Artist <span className="text-sw-green">*</span>
            </Label>
            <Input
              id="song-artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              className="bg-[oklch(0.14_0_0)] border-[oklch(0.25_0_0)] text-white placeholder:text-[oklch(0.4_0_0)] focus:border-[oklch(0.5_0_0)]"
              required
            />
          </div>

          {/* Album + Genre side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="song-album"
                className="text-sm font-medium text-[oklch(0.75_0_0)] mb-1.5 block"
              >
                Album <span className="text-[oklch(0.45_0_0)] text-xs">(optional)</span>
              </Label>
              <Input
                id="song-album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Album name"
                className="bg-[oklch(0.14_0_0)] border-[oklch(0.25_0_0)] text-white placeholder:text-[oklch(0.4_0_0)] focus:border-[oklch(0.5_0_0)]"
              />
            </div>
            <div>
              <Label
                htmlFor="song-genre"
                className="text-sm font-medium text-[oklch(0.75_0_0)] mb-1.5 block"
              >
                Genre <span className="text-[oklch(0.45_0_0)] text-xs">(optional)</span>
              </Label>
              <select
                id="song-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full h-10 bg-[oklch(0.14_0_0)] border border-[oklch(0.25_0_0)] text-white rounded-md px-3 text-sm outline-none focus:border-[oklch(0.5_0_0)] transition-colors"
              >
                <option value="" className="bg-[oklch(0.14_0_0)]">Select genre</option>
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g} className="bg-[oklch(0.14_0_0)]">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress bar */}
          {uploadSong.isPending && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[oklch(0.55_0_0)]">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-1.5 bg-[oklch(0.22_0_0)] [&>div]:bg-sw-green"
              />
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={!isValid || uploadSong.isPending}
            className="w-full bg-sw-green text-black font-semibold hover:bg-sw-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadSong.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CloudUpload size={16} className="mr-2" />
                Upload Song
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
