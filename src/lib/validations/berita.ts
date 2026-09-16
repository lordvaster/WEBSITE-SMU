import { z } from "zod";

// Restricted to paths produced by our own upload endpoint (see src/lib/upload.ts).
const uploadedImagePath = /^\/uploads\/(berita|galeri)\/[A-Za-z0-9_-]+\.(jpeg|jpg|png|webp|gif)$/;

export const beritaSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  konten: z.string().min(1, "Konten wajib diisi"),
  gambar: z.string().regex(uploadedImagePath).optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
});

export type BeritaInput = z.infer<typeof beritaSchema>;
