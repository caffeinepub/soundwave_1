export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: bigint): string {
  const n = Number(seconds);
  return formatTime(n);
}

const GRADIENT_PALETTES = [
  ["#E91E63", "#9C27B0"],
  ["#1DB954", "#006400"],
  ["#2196F3", "#0D47A1"],
  ["#FF5722", "#B71C1C"],
  ["#00BCD4", "#006064"],
  ["#FF9800", "#E65100"],
  ["#9C27B0", "#4A148C"],
  ["#4CAF50", "#1B5E20"],
  ["#F44336", "#880E4F"],
  ["#3F51B5", "#1A237E"],
];

export function getCoverGradient(id: bigint | number): string {
  const idx = Number(id) % GRADIENT_PALETTES.length;
  const [from, to] = GRADIENT_PALETTES[idx];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

export function getGenreGradient(genre: string): string {
  const genreMap: Record<string, string> = {
    pop: "linear-gradient(135deg, #E91E63, #FF5722)",
    rock: "linear-gradient(135deg, #424242, #B71C1C)",
    jazz: "linear-gradient(135deg, #1565C0, #4A148C)",
    classical: "linear-gradient(135deg, #4E342E, #880E4F)",
    electronic: "linear-gradient(135deg, #00BCD4, #1DB954)",
    hiphop: "linear-gradient(135deg, #37474F, #FF5722)",
    "hip-hop": "linear-gradient(135deg, #37474F, #FF5722)",
    rnb: "linear-gradient(135deg, #9C27B0, #E91E63)",
    "r&b": "linear-gradient(135deg, #9C27B0, #E91E63)",
    country: "linear-gradient(135deg, #8D6E63, #FF6F00)",
    ambient: "linear-gradient(135deg, #0288D1, #1B5E20)",
    folk: "linear-gradient(135deg, #795548, #33691E)",
    indie: "linear-gradient(135deg, #E040FB, #00BCD4)",
    metal: "linear-gradient(135deg, #263238, #B71C1C)",
    reggae: "linear-gradient(135deg, #F9A825, #1B5E20)",
    blues: "linear-gradient(135deg, #1565C0, #880E4F)",
    soul: "linear-gradient(135deg, #D84315, #4A148C)",
    latin: "linear-gradient(135deg, #F57F17, #B71C1C)",
  };
  const key = genre.toLowerCase().replace(/[^a-z&-]/g, "");
  return genreMap[key] || "linear-gradient(135deg, #37474F, #263238)";
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
