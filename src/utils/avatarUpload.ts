export const MAX_AVATAR_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const AVATAR_OUTPUT_SIZE = 256;

export const ALLOWED_AVATAR_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAvatarFile(file: {
  type: string;
  size: number;
}): AvatarValidationResult {
  const mime = (file.type || '').toLowerCase();
  if (!ALLOWED_AVATAR_MIME_TYPES.has(mime)) {
    return {
      valid: false,
      error: 'يرجى اختيار صورة بصيغة مدعومة (PNG أو JPG أو WEBP).',
    };
  }
  if (file.size <= 0) {
    return {
      valid: false,
      error: 'ملف الصورة فارغ أو غير صالح.',
    };
  }
  if (file.size > MAX_AVATAR_FILE_BYTES) {
    return {
      valid: false,
      error: 'حجم الصورة يتجاوز 5 ميغابايت، يرجى اختيار صورة أصغر.',
    };
  }
  return { valid: true };
}

export interface SquareCropMetrics {
  sx: number;
  sy: number;
  size: number;
}

export function computeSquareCropMetrics(
  width: number,
  height: number
): SquareCropMetrics {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const size = Math.min(safeW, safeH);
  const sx = Math.floor((safeW - size) / 2);
  const sy = Math.floor((safeH - size) / 2);
  return { sx, sy, size };
}

export async function processAvatarImageFile(file: File): Promise<string> {
  const check = validateAvatarFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('تعذر قراءة ملف الصورة.'));
      }
    };
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.readAsDataURL(file);
  });

  // Load into Image and center-crop/scale to 256x256 so localStorage stays lightweight
  return await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_OUTPUT_SIZE;
        canvas.height = AVATAR_OUTPUT_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        const { sx, sy, size } = computeSquareCropMetrics(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height
        );
        ctx.drawImage(
          img,
          sx,
          sy,
          size,
          size,
          0,
          0,
          AVATAR_OUTPUT_SIZE,
          AVATAR_OUTPUT_SIZE
        );
        const compressed = canvas.toDataURL('image/jpeg', 0.86);
        resolve(compressed || rawDataUrl);
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => reject(new Error('الملف المختار ليس صورة صالحة.'));
    img.src = rawDataUrl;
  });
}
