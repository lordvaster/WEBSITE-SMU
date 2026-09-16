import { db } from "@/lib/db";
import { requireAdmin, handleApiError } from "@/lib/api-helpers";

function csvEscape(value: unknown): string {
  let str = String(value ?? "");
  // Neutralize spreadsheet formula triggers (CSV/formula injection, CWE-1236) — a cell
  // starting with =, +, -, or @ can execute as a formula when opened in Excel/Sheets.
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get("kelasId");
    const semester = searchParams.get("semester");
    const mapel = searchParams.get("mapel");

    const nilai = await db.nilai.findMany({
      where: {
        ...(semester ? { semester: Number(semester) } : {}),
        ...(mapel ? { mapel } : {}),
        siswa: kelasId ? { kelasId } : undefined,
      },
      include: { siswa: { include: { kelas: true } } },
      orderBy: [{ siswa: { nama: "asc" } }, { mapel: "asc" }],
    });

    const header = [
      "NISN",
      "Nama Siswa",
      "Kelas",
      "Mata Pelajaran",
      "Semester",
      "Nilai Harian",
      "Nilai UTS",
      "Nilai UAS",
      "Nilai Akhir",
    ];

    const rows = nilai.map((n) =>
      [
        n.siswa.nisn,
        n.siswa.nama,
        n.siswa.kelas.nama,
        n.mapel,
        n.semester,
        n.nilai_harian,
        n.nilai_uts ?? "",
        n.nilai_uas ?? "",
        n.nilai_akhir ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nilai-export.csv"`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
