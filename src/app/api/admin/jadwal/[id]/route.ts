import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { jadwalSchema } from "@/lib/validations/jadwal";
import { rangesOverlap } from "@/lib/text";
import { cacheDel } from "@/lib/cache";
import { JADWAL_CACHE_KEY } from "@/lib/cache-keys";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = jadwalSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.jadwal.findUnique({ where: { id } });
    if (!existing) return fail("Jadwal tidak ditemukan", 404);

    const conflicts = await db.jadwal.findMany({
      where: {
        id: { not: id },
        hari: data.hari,
        OR: [{ guruId: data.guruId }, { kelasId: data.kelasId }, { ruangan: data.ruangan }],
      },
    });

    for (const c of conflicts) {
      if (!rangesOverlap(data.jam_mulai, data.jam_selesai, c.jam_mulai, c.jam_selesai)) continue;
      if (c.guruId === data.guruId) return fail("Guru sudah memiliki jadwal lain pada jam tersebut", 409);
      if (c.kelasId === data.kelasId) return fail("Kelas sudah memiliki jadwal lain pada jam tersebut", 409);
      if (c.ruangan === data.ruangan) return fail("Ruangan sudah digunakan pada jam tersebut", 409);
    }

    const jadwal = await db.jadwal.update({
      where: { id },
      data,
      include: { kelas: true, guru: true },
    });

    await cacheDel(JADWAL_CACHE_KEY);
    return ok(jadwal, "Jadwal berhasil diperbarui");
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.jadwal.findUnique({ where: { id } });
    if (!existing) return fail("Jadwal tidak ditemukan", 404);

    await db.jadwal.delete({ where: { id } });
    await cacheDel(JADWAL_CACHE_KEY);
    return ok(null, "Jadwal berhasil dihapus");
  } catch (e) {
    return handleApiError(e);
  }
}
