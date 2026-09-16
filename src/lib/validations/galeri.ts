import { z } from "zod";

// Restricted to paths produced by our own upload endpoint (see src/lib/upload.ts) so that
// stored values can never be used to escape public/uploads on delete (path traversal).
const uploadedImagePath = /^\/uploads\/(berita|galeri)\/[A-Za-z0-9_-]+\.(jpeg|jpg|png|webp|gif)$/;

export const galeriSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional().or(z.literal("")),
  gambar: z.string().regex(uploadedImagePath, "Gambar harus diunggah melalui form ini"),
  tipe: z.enum(["foto", "video"]),
  link_video: z.string().optional().or(z.literal("")),
});

export type GaleriInput = z.infer<typeof galeriSchema>;
