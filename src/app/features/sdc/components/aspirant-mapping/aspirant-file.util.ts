/** Formats a byte count as megabytes with one decimal, e.g. `1572864` -> `1.5 MB`. */
export function formatFileSizeMb(sizeInBytes: number): string {
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Reads a file as a data URL and hands the result to `onLoad`. */
export function readFileAsDataUrl(file: File, onLoad: (dataUrl: string) => void): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    onLoad(e.target?.result as string);
  };
  reader.readAsDataURL(file);
}
