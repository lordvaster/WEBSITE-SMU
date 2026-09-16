import { z } from "zod";

export const nilaiSchema = z.object({
  siswaId: z.string().min(1, "Siswa wajib dipilih"),
  mapel: z.string().min(1, "Mata pelajaran wajib diisi"),
  semester: z.coerce.number().int().min(1).max(2),
  nilai_harian: z.coerce.number().min(0).max(100),
  nilai_uts: z.coerce.number().min(0).max(100),
  nilai_uas: z.coerce.number().min(0).max(100),
  keterangan: z.string().optional().or(z.literal("")),
});

export type NilaiInput = z.infer<typeof nilaiSchema>;

export function calculateNilaiAkhir(harian: number, uts: number, uas: number): number {
  return Math.round((harian * 0.2 + uts * 0.3 + uas * 0.5) * 100) / 100;
}
