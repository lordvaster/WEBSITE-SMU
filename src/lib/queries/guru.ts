import { db } from "@/lib/db";

export async function getGuruByUserId(userId: string) {
  return db.guru.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  });
}

export async function getGuruJadwal(guruId: string) {
  return db.jadwal.findMany({
    where: { guruId },
    include: { kelas: true },
    orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
  });
}

/** Kelas a guru teaches, derived from their jadwal entries (distinct kelasId). */
export async function getGuruKelas(guruId: string) {
  const jadwal = await db.jadwal.findMany({
    where: { guruId },
    select: { kelas: true },
    distinct: ["kelasId"],
  });
  return jadwal.map((j) => j.kelas);
}

export async function guruTeachesKelas(guruId: string, kelasId: string): Promise<boolean> {
  const count = await db.jadwal.count({ where: { guruId, kelasId } });
  return count > 0;
}

export async function getSiswaInKelas(kelasId: string) {
  return db.siswa.findMany({
    where: { kelasId },
    orderBy: { nama: "asc" },
  });
}

/** Student counts for multiple kelas in a single grouped query instead of one count per kelas. */
export async function getSiswaCountByKelas(kelasIds: string[]): Promise<Map<string, number>> {
  if (kelasIds.length === 0) return new Map();
  const grouped = await db.siswa.groupBy({
    by: ["kelasId"],
    where: { kelasId: { in: kelasIds } },
    _count: { _all: true },
  });
  return new Map(grouped.map((g) => [g.kelasId, g._count._all]));
}
