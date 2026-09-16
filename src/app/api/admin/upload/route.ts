import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "misc");

    if (!(file instanceof File)) {
      return fail("File tidak ditemukan", 400);
    }
    if (!["berita", "galeri"].includes(folder)) {
      return fail("Folder tidak valid", 400);
    }

    const url = await saveUploadedImage(file, folder);
    return ok({ url }, "File berhasil diunggah");
  } catch (e) {
    return handleApiError(e);
  }
}
