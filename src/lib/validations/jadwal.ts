import { z } from "zod";

export const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const jadwalSchema = z
  .object({
    hari: z.enum(HARI_LIST),
    jam_mulai: z.string().regex(timeRegex, "Format jam tidak valid (HH:MM)"),
    jam_selesai: z.string().regex(timeRegex, "Format jam tidak valid (HH:MM)"),
    mapel: z.string().min(1, "Mata pelajaran wajib diisi"),
    ruangan: z.string().min(1, "Ruangan wajib diisi"),
    kelasId: z.string().min(1, "Kelas wajib dipilih"),
    guruId: z.string().min(1, "Guru wajib dipilih"),
  })
  .refine((data) => data.jam_selesai > data.jam_mulai, {
    message: "Jam selesai harus setelah jam mulai",
    path: ["jam_selesai"],
  });

export type JadwalInput = z.infer<typeof jadwalSchema>;
