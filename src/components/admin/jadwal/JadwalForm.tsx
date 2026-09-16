"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { jadwalSchema, HARI_LIST, type JadwalInput } from "@/lib/validations/jadwal";
import type { JadwalRow } from "@/components/admin/jadwal/JadwalCalendar";

type KelasOption = { id: string; nama: string };
type GuruOption = { id: string; nama: string; mata_pelajaran: string[] };

export function JadwalForm({
  open,
  onOpenChange,
  jadwal,
  defaultHari,
  kelasOptions,
  guruOptions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jadwal: JadwalRow | null;
  defaultHari: string;
  kelasOptions: KelasOption[];
  guruOptions: GuruOption[];
  onSaved: () => void;
}) {
  const isEdit = !!jadwal;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JadwalInput>({
    resolver: zodResolver(jadwalSchema),
  });

  const selectedMapel = watch("mapel");

  useEffect(() => {
    if (open) {
      if (jadwal) {
        reset({
          hari: jadwal.hari as JadwalInput["hari"],
          jam_mulai: jadwal.jam_mulai,
          jam_selesai: jadwal.jam_selesai,
          mapel: jadwal.mapel,
          ruangan: jadwal.ruangan,
          kelasId: jadwal.kelasId,
          guruId: jadwal.guruId,
        });
      } else {
        reset({
          hari: defaultHari as JadwalInput["hari"],
          jam_mulai: "07:00",
          jam_selesai: "08:30",
          mapel: "",
          ruangan: "",
          kelasId: kelasOptions[0]?.id ?? "",
          guruId: guruOptions[0]?.id ?? "",
        });
      }
    }
  }, [open, jadwal, defaultHari, kelasOptions, guruOptions, reset]);

  const filteredGuru = selectedMapel
    ? guruOptions.filter((g) => g.mata_pelajaran.some((m) => m.toLowerCase() === selectedMapel.toLowerCase()))
    : guruOptions;

  const onSubmit = async (values: JadwalInput) => {
    const url = isEdit ? `/api/admin/jadwal/${jadwal!.id}` : "/api/admin/jadwal";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyimpan jadwal");
      return;
    }

    toast.success(json.message || "Jadwal berhasil disimpan");
    onOpenChange(false);
    onSaved();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Jadwal" : "Tambah Jadwal"} className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hari</label>
              <select className={inputClass} {...register("hari")}>
                {HARI_LIST.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ruangan</label>
              <input className={inputClass} placeholder="Ruang 1" {...register("ruangan")} />
              {errors.ruangan && <p className={errorClass}>{errors.ruangan.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Jam Mulai</label>
              <input className={inputClass} type="time" {...register("jam_mulai")} />
              {errors.jam_mulai && <p className={errorClass}>{errors.jam_mulai.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Jam Selesai</label>
              <input className={inputClass} type="time" {...register("jam_selesai")} />
              {errors.jam_selesai && <p className={errorClass}>{errors.jam_selesai.message}</p>}
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Mata Pelajaran</label>
              <input className={inputClass} {...register("mapel")} />
              {errors.mapel && <p className={errorClass}>{errors.mapel.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Kelas</label>
              <select className={inputClass} {...register("kelasId")}>
                {kelasOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
              {errors.kelasId && <p className={errorClass}>{errors.kelasId.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Guru</label>
              <select className={inputClass} {...register("guruId")}>
                {filteredGuru.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama}
                  </option>
                ))}
              </select>
              {errors.guruId && <p className={errorClass}>{errors.guruId.message}</p>}
            </div>
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
