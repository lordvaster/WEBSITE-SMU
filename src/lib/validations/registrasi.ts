import { z } from "zod";

export const registrasiSchema = z.object({
  nama: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  no_telepon: z.string().min(8, "Nomor telepon tidak valid"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  asal_sekolah: z.string().min(1, "Asal sekolah wajib diisi"),
  nilai_rata_rata: z.coerce.number().min(0).max(100),
  tahun_lulus: z.coerce.number().int().min(2000).max(2100),
  jurusan_diminati: z.enum(["IPA", "IPS", "Bahasa"]),
  catatan: z.string().optional().or(z.literal("")),
  agree: z.boolean().refine((v) => v === true, {
    message: "Anda harus menyetujui syarat dan ketentuan",
  }),
});

export type RegistrasiInput = z.infer<typeof registrasiSchema>;
