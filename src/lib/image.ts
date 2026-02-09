const MAX_SIZE = 400;
const QUALITY = 0.7;

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        // Scale down to MAX_SIZE maintaining aspect ratio
        if (w > h) {
          if (w > MAX_SIZE) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
        } else {
          if (h > MAX_SIZE) { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }
        }

        // Crop to square
        const size = Math.min(w, h);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d')!;
        const sx = (img.width - img.width * (size / w)) / 2;
        const sy = (img.height - img.height * (size / h)) / 2;
        const sw = img.width * (size / w);
        const sh = img.height * (size / h);

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getStorageUsage(): { used: number; max: number; percent: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += localStorage.getItem(key)?.length ?? 0;
    }
  }
  // Most browsers limit to ~5MB
  const max = 5 * 1024 * 1024;
  return { used, max, percent: Math.round((used / max) * 100) };
}
