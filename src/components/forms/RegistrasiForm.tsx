"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PartyPopper } from "lucide-react";
import { registrasiSchema } from "@/lib/validations/registrasi";
import type { z } from "zod";

type RegistrasiFormValues = z.input<typeof registrasiSchema>;

const CURRENT_YEAR = new Date().getFullYear();

export function RegistrasiForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrasiFormValues>({
    resolver: zodResolver(registrasiSchema),
    defaultValues: { tahun_lulus: CURRENT_YEAR, jurusan_diminati: "IPA" },
  });

  const onSubmit = async (values: RegistrasiFormValues) => {
    setServerError(null);
    const res = await fetch("/api/registrasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      setServerError(json.message || "Gagal mengirim formulir");
      return;
    }

    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <PartyPopper className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <h2 className="text-lg font-semibold text-green-800">Pendaftaran Terkirim!</h2>
        <p className="mt-2 text-sm text-green-700">
          Terima kasih! Silakan cek email Anda untuk konfirmasi dan verifikasi alamat email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nama Lengkap</label>
          <input className={inputClass} {...register("nama")} />
          {errors.nama && <p className={errorClass}>{errors.nama.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} type="email" {...register("email")} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>No Telepon</label>
          <input className={inputClass} {...register("no_telepon")} />
          {errors.no_telepon && <p className={errorClass}>{errors.no_telepon.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Asal Sekolah</label>
          <input className={inputClass} {...register("asal_sekolah")} />
          {errors.asal_sekolah && <p className={errorClass}>{errors.asal_sekolah.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Nilai Rata-rata</label>
          <input className={inputClass} type="number" min={0} max={100} step="0.01" {...register("nilai_rata_rata")} />
          {errors.nilai_rata_rata && <p className={errorClass}>{errors.nilai_rata_rata.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Tahun Lulus</label>
          <input className={inputClass} type="number" {...register("tahun_lulus")} />
          {errors.tahun_lulus && <p className={errorClass}>{errors.tahun_lulus.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Jurusan yang Diminati</label>
          <div className="flex gap-4 pt-1">
            {["IPA", "IPS", "Bahasa"].map((j) => (
              <label key={j} className="flex items-center gap-1.5 text-sm">
                <input type="radio" value={j} {...register("jurusan_diminati")} /> {j}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Alamat</label>
          <textarea className={inputClass} rows={2} {...register("alamat")} />
          {errors.alamat && <p className={errorClass}>{errors.alamat.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Catatan Tambahan (opsional)</label>
          <textarea className={inputClass} rows={2} {...register("catatan")} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300" {...register("agree")} />
        Saya menyetujui syarat dan ketentuan pendaftaran calon siswa baru.
      </label>
      {errors.agree && <p className={errorClass}>{errors.agree.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Daftar Sekarang
      </button>
    </form>
  );
}
