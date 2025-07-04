export function isValidVideoUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  const gcsRegex = /^https:\/\/storage\.googleapis\.com\/.+\.(mp4|webm|mov)$/i;
  const directVideoRegex = /^https?:\/\/.+\.(mp4|webm|mov)$/i;
  return youtubeRegex.test(url) || gcsRegex.test(url) || directVideoRegex.test(url);
}

export function isValidYouTubeUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const ytRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/)?[\w-]{11}(\S*)?$/;
  return ytRegex.test(url.trim());
}
