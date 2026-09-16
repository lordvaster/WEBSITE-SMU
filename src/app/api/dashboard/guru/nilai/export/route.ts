import { db } from "@/lib/db";
import { requireRole, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, guruTeachesKelas } from "@/lib/queries/guru";

function csvEscape(value: unknown): string {
  let str = String(value ?? "");
  if (/^[=+\-@]/.test(str)) str = `'${str}`;
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: Request) {
  try {
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get("kelasId");
    if (!kelasId) return fail("kelasId wajib diisi", 400);

    const owns = await guruTeachesKelas(guru.id, kelasId);
    if (!owns) return fail("Anda tidak mengajar di kelas ini", 403);

    const nilai = await db.nilai.findMany({
      where: {
        mapel: { in: guru.mata_pelajaran },
        siswa: { kelasId },
      },
      include: { siswa: { include: { kelas: true } } },
      orderBy: [{ siswa: { nama: "asc" } }, { mapel: "asc" }],
    });

    const header = ["NISN", "Nama Siswa", "Kelas", "Mata Pelajaran", "Semester", "Harian", "UTS", "UAS", "Nilai Akhir"];
    const rows = nilai.map((n) =>
      [n.siswa.nisn, n.siswa.nama, n.siswa.kelas.nama, n.mapel, n.semester, n.nilai_harian, n.nilai_uts ?? "", n.nilai_uas ?? "", n.nilai_akhir ?? ""]
        .map(csvEscape)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nilai-kelas.csv"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
