"use client";

import Image from "next/image";
import { Pencil, Trash2, Video } from "lucide-react";

export type GaleriRow = {
  id: string;
  judul: string;
  deskripsi: string | null;
  gambar: string;
  tipe: string;
  link_video: string | null;
};

export function GaleriGrid({
  data,
  loading,
  onEdit,
  onDelete,
}: {
  data: GaleriRow[];
  loading: boolean;
  onEdit: (row: GaleriRow) => void;
  onDelete: (row: GaleriRow) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-400">
        Belum ada item galeri.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {data.map((item) => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image src={item.gambar} alt={item.judul} fill sizes="240px" className="object-cover" />
          {item.tipe === "video" && (
            <span className="absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
              <Video className="h-3.5 w-3.5" />
            </span>
          )}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
            <p className="truncate text-sm font-medium text-white">{item.judul}</p>
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => onEdit(item)}
                className="rounded-md bg-white/90 p-1.5 text-slate-700 hover:bg-white"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="rounded-md bg-white/90 p-1.5 text-red-600 hover:bg-white"
                title="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
