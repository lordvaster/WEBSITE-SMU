import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ApiError } from "@/lib/api-helpers";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function matchesSignature(buffer: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case "image/gif":
      return (
        buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
      );
    case "image/webp":
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );
    default:
      return false;
  }
}

export async function saveUploadedImage(file: File, subfolder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError("Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.", 400);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ApiError("Ukuran file maksimal 5MB.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Don't trust the client-supplied Content-Type alone — verify the actual file bytes
  // match a known image signature before writing it to disk.
  if (!matchesSignature(buffer, file.type)) {
    throw new ApiError("Isi file tidak sesuai dengan tipe gambar yang diklaim.", 400);
  }

  const ext = file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(UPLOADS_ROOT, subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subfolder}/${filename}`;
}

/**
 * Resolves a stored "/uploads/..." path to an absolute filesystem path, refusing to
 * return anything outside public/uploads even if the stored value has been tampered
 * with (defense in depth on top of the strict regex in the galeri/berita zod schemas).
 */
export function resolveUploadPath(storedPath: string): string | null {
  if (!storedPath.startsWith("/uploads/")) return null;
  const resolved = path.normalize(path.join(process.cwd(), "public", storedPath));
  const rootWithSep = UPLOADS_ROOT + path.sep;
  if (resolved !== UPLOADS_ROOT && !resolved.startsWith(rootWithSep)) return null;
  return resolved;
}
