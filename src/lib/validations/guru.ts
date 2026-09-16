import { z } from "zod";

export const guruCreateSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  nip: z.string().min(5, "NIP wajib diisi"),
  gelar_depan: z.string().optional().or(z.literal("")),
  gelar_belakang: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  mata_pelajaran: z.array(z.string().min(1)).min(1, "Pilih minimal 1 mata pelajaran"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  no_telepon: z.string().min(8, "Nomor telepon tidak valid"),
});

export const guruUpdateSchema = guruCreateSchema.omit({ nip: true }).extend({
  password: z.string().min(8).optional().or(z.literal("")),
});

export type GuruCreateInput = z.infer<typeof guruCreateSchema>;
export type GuruUpdateInput = z.infer<typeof guruUpdateSchema>;
