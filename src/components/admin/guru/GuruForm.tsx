"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { guruCreateSchema, guruUpdateSchema } from "@/lib/validations/guru";
import { generatePassword } from "@/lib/text";
import type { GuruRow } from "@/components/admin/guru/GuruTable";

type FormValues = {
  nama: string;
  nip: string;
  gelar_depan: string;
  gelar_belakang: string;
  email: string;
  password: string;
  mata_pelajaran: string; // comma-separated in the form, converted to array on submit
  alamat: string;
  no_telepon: string;
};

export function GuruForm({
  open,
  onOpenChange,
  guru,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guru: GuruRow | null;
  onSaved: () => void;
}) {
  const isEdit = !!guru;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    if (open) {
      if (guru) {
        reset({
          nama: guru.nama,
          nip: guru.nip,
          gelar_depan: guru.gelar_depan ?? "",
          gelar_belakang: guru.gelar_belakang ?? "",
          email: guru.user.email,
          password: "",
          mata_pelajaran: guru.mata_pelajaran.join(", "),
          alamat: guru.alamat,
          no_telepon: guru.no_telepon,
        });
      } else {
        reset({
          nama: "",
          nip: "",
          gelar_depan: "",
          gelar_belakang: "",
          email: "",
          password: generatePassword(),
          mata_pelajaran: "",
          alamat: "",
          no_telepon: "",
        });
      }
    }
  }, [open, guru, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      mata_pelajaran: values.mata_pelajaran
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    };

    const schema = isEdit ? guruUpdateSchema : guruCreateSchema;
    const parsed = schema.safeParse(isEdit && !payload.password ? { ...payload, password: "x".repeat(8) } : payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }

    const finalPayload: Record<string, unknown> = { ...payload };
    if (isEdit && !values.password) {
      delete finalPayload.password;
    }

    const url = isEdit ? `/api/admin/guru/${guru!.id}` : "/api/admin/guru";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyimpan data guru");
      return;
    }

    toast.success(json.message || "Data guru berhasil disimpan");
    onOpenChange(false);
    onSaved();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Guru" : "Tambah Guru"} className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>NIP</label>
              <input className={inputClass} disabled={isEdit} {...register("nip")} />
            </div>
            <div>
              <label className={labelClass}>Nama</label>
              <input className={inputClass} {...register("nama")} />
            </div>

            <div>
              <label className={labelClass}>Gelar Depan</label>
              <input className={inputClass} placeholder="Dr., S.Pd., dll" {...register("gelar_depan")} />
            </div>
            <div>
              <label className={labelClass}>Gelar Belakang</label>
              <input className={inputClass} placeholder="M.Pd., M.Si., dll" {...register("gelar_belakang")} />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" {...register("email")} />
            </div>
            <div>
              <label className={labelClass}>
                Password {isEdit && <span className="text-slate-400">(kosongkan jika tidak diubah)</span>}
              </label>
              <div className="flex gap-2">
                <input className={inputClass} type="text" {...register("password")} />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => setValue("password", generatePassword())}
                    className="shrink-0 rounded-lg border border-slate-300 px-2.5 text-slate-500 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Mata Pelajaran (pisahkan dengan koma)</label>
              <input className={inputClass} placeholder="Matematika, Fisika" {...register("mata_pelajaran")} />
              {errors.mata_pelajaran && <p className={errorClass}>{errors.mata_pelajaran.message}</p>}
            </div>

            <div>
              <label className={labelClass}>No Telepon</label>
              <input className={inputClass} {...register("no_telepon")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Alamat</label>
              <textarea className={inputClass} rows={2} {...register("alamat")} />
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
