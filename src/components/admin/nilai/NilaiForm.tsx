"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { nilaiSchema, calculateNilaiAkhir } from "@/lib/validations/nilai";
import type { NilaiRow } from "@/components/admin/nilai/NilaiTable";
import type { z } from "zod";

type SiswaOption = { id: string; nama: string; nisn: string };
type NilaiFormValues = z.input<typeof nilaiSchema>;

export function NilaiForm({
  open,
  onOpenChange,
  nilai,
  siswaOptions,
  mapelOptions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nilai: NilaiRow | null;
  siswaOptions: SiswaOption[];
  mapelOptions: string[];
  onSaved: () => void;
}) {
  const isEdit = !!nilai;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NilaiFormValues>({
    resolver: zodResolver(nilaiSchema),
  });

  const harian = watch("nilai_harian");
  const uts = watch("nilai_uts");
  const uas = watch("nilai_uas");
  const preview =
    harian !== undefined && uts !== undefined && uas !== undefined && !Number.isNaN(harian) && !Number.isNaN(uts) && !Number.isNaN(uas)
      ? calculateNilaiAkhir(Number(harian), Number(uts), Number(uas))
      : null;

  useEffect(() => {
    if (open) {
      if (nilai) {
        reset({
          siswaId: nilai.siswaId,
          mapel: nilai.mapel,
          semester: nilai.semester,
          nilai_harian: nilai.nilai_harian,
          nilai_uts: nilai.nilai_uts ?? 0,
          nilai_uas: nilai.nilai_uas ?? 0,
        });
      } else {
        reset({
          siswaId: siswaOptions[0]?.id ?? "",
          mapel: mapelOptions[0] ?? "",
          semester: 1,
          nilai_harian: 0,
          nilai_uts: 0,
          nilai_uas: 0,
        });
      }
    }
  }, [open, nilai, siswaOptions, mapelOptions, reset]);

  const onSubmit = async (values: NilaiFormValues) => {
    const url = isEdit ? `/api/admin/nilai/${nilai!.id}` : "/api/admin/nilai";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyimpan nilai");
      return;
    }

    toast.success(json.message || "Nilai berhasil disimpan");
    onOpenChange(false);
    onSaved();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Nilai" : "Tambah Nilai"} className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className={labelClass}>Siswa</label>
            <Controller
              control={control}
              name="siswaId"
              render={({ field }) => (
                <SearchableSelect
                  disabled={isEdit}
                  value={field.value}
                  onChange={field.onChange}
                  options={siswaOptions.map((s) => ({ value: s.id, label: `${s.nama} (${s.nisn})` }))}
                  placeholder="Pilih siswa"
                />
              )}
            />
            {errors.siswaId && <p className={errorClass}>{errors.siswaId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mata Pelajaran</label>
              <input className={inputClass} list="mapel-options" disabled={isEdit} {...register("mapel")} />
              <datalist id="mapel-options">
                {mapelOptions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              {errors.mapel && <p className={errorClass}>{errors.mapel.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value={1} disabled={isEdit} {...register("semester")} /> Semester 1
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value={2} disabled={isEdit} {...register("semester")} /> Semester 2
                </label>
              </div>
            </div>

            <div>
              <label className={labelClass}>Nilai Harian</label>
              <input className={inputClass} type="number" min={0} max={100} {...register("nilai_harian")} />
              {errors.nilai_harian && <p className={errorClass}>{errors.nilai_harian.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Nilai UTS</label>
              <input className={inputClass} type="number" min={0} max={100} {...register("nilai_uts")} />
              {errors.nilai_uts && <p className={errorClass}>{errors.nilai_uts.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Nilai UAS</label>
              <input className={inputClass} type="number" min={0} max={100} {...register("nilai_uas")} />
              {errors.nilai_uas && <p className={errorClass}>{errors.nilai_uas.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Nilai Akhir (otomatis)</label>
              <div className="flex h-[38px] items-center rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                {preview ?? "-"}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Nilai Akhir = Harian × 20% + UTS × 30% + UAS × 50%
          </p>

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
