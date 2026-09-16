import { db } from "@/lib/db";

export async function getSiswaByUserId(userId: string) {
  return db.siswa.findUnique({
    where: { userId },
    include: { kelas: true, user: { select: { email: true } } },
  });
}

export async function getSiswaJadwal(kelasId: string) {
  return db.jadwal.findMany({
    where: { kelasId },
    include: { guru: true },
    orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
  });
}

export async function getSiswaNilai(siswaId: string) {
  return db.nilai.findMany({
    where: { siswaId },
    orderBy: [{ semester: "asc" }, { mapel: "asc" }],
  });
}
