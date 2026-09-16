"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/admin/berita/RichTextEditor";
import { beritaSchema, type BeritaInput } from "@/lib/validations/berita";
import { slugify } from "@/lib/text";
import type { BeritaRow } from "@/components/admin/berita/BeritaTable";

export function BeritaForm({
  open,
  onOpenChange,
  berita,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  berita: BeritaRow | null;
  onSaved: () => void;
}) {
  const isEdit = !!berita;
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BeritaInput>({
    resolver: zodResolver(beritaSchema),
  });

  const judul = watch("judul");
  const gambar = watch("gambar");

  useEffect(() => {
    if (!isEdit && !slugTouched && judul) {
      setValue("slug", slugify(judul));
    }
  }, [judul, isEdit, slugTouched, setValue]);

  useEffect(() => {
    if (open) {
      setSlugTouched(false);
      if (berita) {
        reset({
          judul: berita.judul,
          slug: berita.slug,
          konten: berita.konten,
          gambar: berita.gambar,
          isPublished: berita.isPublished,
        });
      } else {
        reset({ judul: "", slug: "", konten: "", gambar: "", isPublished: false });
      }
    }
  }, [open, berita, reset]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "berita");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal mengunggah gambar");
        return;
      }
      setValue("gambar", json.data.url);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: BeritaInput) => {
    const url = isEdit ? `/api/admin/berita/${berita!.id}` : "/api/admin/berita";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyimpan berita");
      return;
    }

    toast.success(json.message || "Berita berhasil disimpan");
    onOpenChange(false);
    onSaved();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Berita" : "Tambah Berita"} className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Judul</label>
              <input className={inputClass} {...register("judul")} />
              {errors.judul && <p className={errorClass}>{errors.judul.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                {...register("slug", { onChange: () => setSlugTouched(true) })}
              />
              {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Gambar Sampul</label>
            <div className="flex items-center gap-3">
              {gambar && (
                <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-200">
                  <Image src={gambar} alt="Preview" fill sizes="96px" className="object-cover" />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-blue-400">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? "Mengunggah..." : "Unggah gambar"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Konten</label>
            <Controller
              control={control}
              name="konten"
              render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
            />
            {errors.konten && <p className={errorClass}>{errors.konten.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" {...register("isPublished")} className="h-4 w-4 rounded border-slate-300" />
            Publikasikan sekarang
          </label>

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
              disabled={isSubmitting}
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
