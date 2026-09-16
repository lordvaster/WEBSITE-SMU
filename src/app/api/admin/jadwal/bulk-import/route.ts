import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { HARI_LIST } from "@/lib/validations/jadwal";
import { rangesOverlap } from "@/lib/text";
import { cacheDel } from "@/lib/cache";
import { JADWAL_CACHE_KEY } from "@/lib/cache-keys";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const rowSchema = z.object({
  hari: z.enum(HARI_LIST),
  jam_mulai: z.string().regex(timeRegex),
  jam_selesai: z.string().regex(timeRegex),
  mapel: z.string().min(1),
  kelas: z.string().min(1),
  guru: z.string().min(1),
  ruangan: z.string().min(1),
});

type RowResult = { row: number; success: boolean; error?: string };

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) return fail("Tidak ada data untuk diimpor", 400);

    const [kelasList, guruList, existingJadwal] = await Promise.all([
      db.kelas.findMany(),
      db.guru.findMany(),
      db.jadwal.findMany(),
    ]);
    const kelasByName = new Map(kelasList.map((k) => [k.nama.toLowerCase().trim(), k]));
    const guruByName = new Map(guruList.map((g) => [g.nama.toLowerCase().trim(), g]));

    const accepted: { hari: string; jam_mulai: string; jam_selesai: string; mapel: string; kelasId: string; guruId: string; ruangan: string }[] = [];
    const results: RowResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const parsed = rowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({ row: rowNumber, success: false, error: parsed.error.issues.map((iss) => iss.message).join(", ") });
        continue;
      }
      const data = parsed.data;

      if (data.jam_selesai <= data.jam_mulai) {
        results.push({ row: rowNumber, success: false, error: "Jam selesai harus setelah jam mulai" });
        continue;
      }

      const kelas = kelasByName.get(data.kelas.toLowerCase().trim());
      const guru = guruByName.get(data.guru.toLowerCase().trim());
      if (!kelas) {
        results.push({ row: rowNumber, success: false, error: `Kelas "${data.kelas}" tidak ditemukan` });
        continue;
      }
      if (!guru) {
        results.push({ row: rowNumber, success: false, error: `Guru "${data.guru}" tidak ditemukan` });
        continue;
      }

      const candidate = {
        hari: data.hari,
        jam_mulai: data.jam_mulai,
        jam_selesai: data.jam_selesai,
        mapel: data.mapel,
        kelasId: kelas.id,
        guruId: guru.id,
        ruangan: data.ruangan,
      };

      const conflictsWithExisting = [...existingJadwal, ...accepted].some((other) => {
        if (other.hari !== candidate.hari) return false;
        if (!rangesOverlap(candidate.jam_mulai, candidate.jam_selesai, other.jam_mulai, other.jam_selesai)) return false;
        return (
          other.guruId === candidate.guruId ||
          other.kelasId === candidate.kelasId ||
          other.ruangan === candidate.ruangan
        );
      });

      if (conflictsWithExisting) {
        results.push({ row: rowNumber, success: false, error: "Bentrok jadwal (guru/kelas/ruangan) pada jam yang sama" });
        continue;
      }

      accepted.push(candidate);
      results.push({ row: rowNumber, success: true });
    }

    if (accepted.length > 0) {
      await db.jadwal.createMany({ data: accepted });
      await cacheDel(JADWAL_CACHE_KEY);
    }

    return ok(
      { total: rows.length, success: accepted.length, failed: rows.length - accepted.length, results },
      `${accepted.length} dari ${rows.length} jadwal berhasil diimpor`
    );
  } catch (e) {
    return handleApiError(e);
  }
}
