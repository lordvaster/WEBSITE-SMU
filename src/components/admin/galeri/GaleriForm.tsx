"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { galeriSchema, type GaleriInput } from "@/lib/validations/galeri";
import type { GaleriRow } from "@/components/admin/galeri/GaleriGrid";

export function GaleriForm({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GaleriRow | null;
  onSaved: () => void;
}) {
  const isEdit = !!item;
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GaleriInput>({
    resolver: zodResolver(galeriSchema),
  });

  const gambar = watch("gambar");
  const tipe = watch("tipe");

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          judul: item.judul,
          deskripsi: item.deskripsi ?? "",
          gambar: item.gambar,
          tipe: item.tipe as "foto" | "video",
          link_video: item.link_video ?? "",
        });
      } else {
        reset({ judul: "", deskripsi: "", gambar: "", tipe: "foto", link_video: "" });
      }
    }
  }, [open, item, reset]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "galeri");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal mengunggah gambar");
        return;
      }
      setValue("gambar", json.data.url, { shouldValidate: true });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: GaleriInput) => {
    const url = isEdit ? `/api/admin/galeri/${item!.id}` : "/api/admin/galeri";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyimpan item galeri");
      return;
    }

    toast.success(json.message || "Item galeri berhasil disimpan");
    onOpenChange(false);
    onSaved();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Galeri" : "Tambah Galeri"} className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className={labelClass}>Judul</label>
            <input className={inputClass} {...register("judul")} />
            {errors.judul && <p className={errorClass}>{errors.judul.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Deskripsi</label>
            <textarea className={inputClass} rows={2} {...register("deskripsi")} />
          </div>

          {!isEdit && (
            <div>
              <label className={labelClass}>Tipe</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value="foto" {...register("tipe")} /> Foto
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value="video" {...register("tipe")} /> Video
                </label>
              </div>
            </div>
          )}

          {tipe === "video" && (
            <div>
              <label className={labelClass}>Link Video (YouTube/Vimeo)</label>
              <input className={inputClass} placeholder="https://youtube.com/..." {...register("link_video")} />
            </div>
          )}

          <div>
            <label className={labelClass}>Gambar</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) uploadFile(file);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-slate-300"
              }`}
            >
              {gambar ? (
                <div className="relative h-32 w-full overflow-hidden rounded-lg">
                  <Image src={gambar} alt="Preview" fill sizes="400px" className="object-cover" />
                </div>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-slate-400" />
                  <p className="text-sm text-slate-500">Seret & lepas gambar di sini, atau</p>
                </>
              )}
              <label className="cursor-pointer text-sm font-medium text-blue-500 hover:underline">
                {uploading ? "Mengunggah..." : gambar ? "Ganti gambar" : "Pilih file"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                />
              </label>
            </div>
            {errors.gambar && <p className={errorClass}>{errors.gambar.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
