import { z } from "zod";

export const siswaCreateSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  nisn: z.string().regex(/^\d{10}$/, "NISN harus 10 digit angka"),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"]),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  no_telepon: z.string().min(8, "Nomor telepon tidak valid"),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
  orang_tua_nama: z.string().min(1, "Nama orang tua wajib diisi"),
  orang_tua_email: z.string().email("Format email orang tua tidak valid"),
  orang_tua_telepon: z.string().min(8, "Nomor telepon orang tua tidak valid"),
});

export const siswaUpdateSchema = siswaCreateSchema
  .omit({ nisn: true, password: true })
  .extend({
    password: z.string().min(8).optional().or(z.literal("")),
  });

export type SiswaCreateInput = z.infer<typeof siswaCreateSchema>;
export type SiswaUpdateInput = z.infer<typeof siswaUpdateSchema>;
