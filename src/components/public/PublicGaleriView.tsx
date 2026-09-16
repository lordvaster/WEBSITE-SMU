"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type GaleriItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  gambar: string;
  tipe: string;
  link_video: string | null;
};

export function PublicGaleriView({ items }: { items: GaleriItem[] }) {
  const [filter, setFilter] = useState<"all" | "foto" | "video">("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = items.filter((i) => filter === "all" || i.tipe === filter);
  const active = activeIndex !== null ? filtered[activeIndex] : null;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["all", "foto", "video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setActiveIndex(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === f ? "bg-blue-500 text-white" : "border border-slate-300 text-slate-600 hover:bg-white"
            }`}
          >
            {f === "all" ? "Semua" : f === "foto" ? "Foto" : "Video"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Belum ada item galeri.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 text-left"
            >
              <Image
                src={item.gambar}
                alt={item.judul}
                fill
                sizes="240px"
                loading="lazy"
                className="object-cover transition group-hover:scale-105"
              />
              {item.tipe === "video" && (
                <span className="absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
                  <Video className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-sm font-medium text-white">{item.judul}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={active !== null} onOpenChange={(v) => !v && setActiveIndex(null)}>
        {active && (
          <DialogContent title={active.judul} description={active.deskripsi ?? undefined} className="max-w-3xl">
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <Image src={active.gambar} alt={active.judul} fill sizes="768px" className="object-contain" />
              </div>

              {filtered.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((i) => (i! > 0 ? i! - 1 : filtered.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
                    aria-label="Sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveIndex((i) => (i! < filtered.length - 1 ? i! + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
                    aria-label="Berikutnya"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {active.tipe === "video" && active.link_video && (
              <a
                href={active.link_video}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-blue-500 hover:underline"
              >
                Tonton video lengkap →
              </a>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
