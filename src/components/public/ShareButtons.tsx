"use client";

import { Printer, Share2, AtSign } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.462 3.479 1.34 4.985L2 22l5.146-1.35a9.958 9.958 0 0 0 4.858 1.237h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.928-7.069a9.935 9.935 0 0 0-7.073-2.818zm0 18.176h-.003a8.19 8.19 0 0 1-4.17-1.14l-.299-.177-3.056.801.816-2.98-.194-.306a8.184 8.184 0 0 1-1.256-4.377c0-4.523 3.68-8.203 8.205-8.203a8.146 8.146 0 0 1 5.802 2.406 8.146 8.146 0 0 1 2.399 5.802c0 4.524-3.68 8.174-8.244 8.174z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: <Share2 className="h-4 w-4" />,
    },
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      icon: <AtSign className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">Bagikan:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          {l.icon}
          {l.label}
        </a>
      ))}
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
      >
        <Printer className="h-4 w-4" />
        Cetak
      </button>
    </div>
  );
}
