import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { jadwalSchema } from "@/lib/validations/jadwal";
import { rangesOverlap } from "@/lib/text";
import { cacheDel } from "@/lib/cache";
import { JADWAL_CACHE_KEY } from "@/lib/cache-keys";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const hari = searchParams.get("hari");
    const kelasId = searchParams.get("kelasId");

    const jadwal = await db.jadwal.findMany({
      where: {
        ...(hari ? { hari } : {}),
        ...(kelasId ? { kelasId } : {}),
      },
      include: { kelas: true, guru: true },
      orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
    });

    return ok(jadwal);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = jadwalSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const sameDay = await db.jadwal.findMany({
      where: {
        hari: data.hari,
        OR: [{ guruId: data.guruId }, { kelasId: data.kelasId }, { ruangan: data.ruangan }],
      },
    });

    for (const existing of sameDay) {
      if (!rangesOverlap(data.jam_mulai, data.jam_selesai, existing.jam_mulai, existing.jam_selesai)) {
        continue;
      }
      if (existing.guruId === data.guruId) {
        return fail("Guru sudah memiliki jadwal lain pada jam tersebut", 409);
      }
      if (existing.kelasId === data.kelasId) {
        return fail("Kelas sudah memiliki jadwal lain pada jam tersebut", 409);
      }
      if (existing.ruangan === data.ruangan) {
        return fail("Ruangan sudah digunakan pada jam tersebut", 409);
      }
    }

    const jadwal = await db.jadwal.create({
      data,
      include: { kelas: true, guru: true },
    });

    await cacheDel(JADWAL_CACHE_KEY);
    return ok(jadwal, "Jadwal berhasil ditambahkan", 201);
  } catch (e) {
    return handleApiError(e);
  }
}
