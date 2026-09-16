"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PartyPopper, ArrowLeft, ArrowRight, Send, Check } from "lucide-react";
import { registrasiSchema } from "@/lib/validations/registrasi";
import type { z } from "zod";

type RegistrasiFormValues = z.input<typeof registrasiSchema>;

const CURRENT_YEAR = new Date().getFullYear();

const STEPS = [
  { label: "Biodata" },
  { label: "Asal Sekolah" },
  { label: "Konfirmasi" },
] as const;

const STEP_FIELDS: Record<number, (keyof RegistrasiFormValues)[]> = {
  1: ["nama", "email", "no_telepon", "alamat"],
  2: ["asal_sekolah", "nilai_rata_rata", "tahun_lulus", "jurusan_diminati", "catatan"],
  3: ["agree"],
};

export function RegistrasiForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegistrasiFormValues>({
    resolver: zodResolver(registrasiSchema),
    mode: "onTouched",
    defaultValues: { tahun_lulus: CURRENT_YEAR, jurusan_diminati: "IPA" },
  });

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-xs text-red-600";
  const requiredMark = <span className="text-red-500">*</span>;

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

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

  if (submitted) {
    return (
      <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-8 text-center">
        <PartyPopper className="mx-auto mb-3 h-10 w-10 text-secondary-500" />
        <h2 className="text-lg font-semibold text-secondary-800">Pendaftaran Terkirim!</h2>
        <p className="mt-2 text-sm text-secondary-700">
          Terima kasih! Silakan cek email Anda untuk konfirmasi dan verifikasi alamat email.
        </p>
      </div>
    );
  }

  const values = getValues();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Progress indicator */}
      <ol className="flex items-center" aria-label="Langkah pendaftaran">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "upcoming";
          return (
            <li key={s.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                    state === "done"
                      ? "bg-secondary-500 text-white"
                      : state === "current"
                        ? "bg-primary-600 text-white ring-4 ring-primary-100"
                        : "bg-slate-100 text-slate-400"
                  }`}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {state === "done" ? <Check className="h-4 w-4" /> : n}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    state === "upcoming" ? "text-slate-400" : "text-slate-700"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {n < STEPS.length && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${n < step ? "bg-secondary-500" : "bg-slate-100"}`} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-center text-xs text-slate-400 sm:hidden">
        Langkah {step}/3 &ndash; {STEPS[step - 1].label}
      </p>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      {/* Step 1: Biodata */}
      {step === 1 && (
        <div className="grid animate-fade-in grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nama Lengkap {requiredMark}</label>
            <input className={inputClass} placeholder="cth. Budi Santoso" {...register("nama")} />
            {errors.nama && <p className={errorClass}>{errors.nama.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Email {requiredMark}</label>
            <input className={inputClass} type="email" placeholder="nama@email.com" {...register("email")} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            <p className="mt-1 text-xs text-slate-400">Link verifikasi akan dikirim ke email ini.</p>
          </div>
          <div>
            <label className={labelClass}>No Telepon {requiredMark}</label>
            <input className={inputClass} placeholder="08xxxxxxxxxx" {...register("no_telepon")} />
            {errors.no_telepon && <p className={errorClass}>{errors.no_telepon.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Alamat {requiredMark}</label>
            <textarea className={inputClass} rows={2} placeholder="Alamat lengkap tempat tinggal" {...register("alamat")} />
            {errors.alamat && <p className={errorClass}>{errors.alamat.message}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Asal Sekolah */}
      {step === 2 && (
        <div className="grid animate-fade-in grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Asal Sekolah {requiredMark}</label>
            <input className={inputClass} placeholder="cth. SMP Negeri 1 Contoh" {...register("asal_sekolah")} />
            {errors.asal_sekolah && <p className={errorClass}>{errors.asal_sekolah.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nilai Rata-rata {requiredMark}</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              step="0.01"
              placeholder="0-100"
              {...register("nilai_rata_rata")}
            />
            {errors.nilai_rata_rata && <p className={errorClass}>{errors.nilai_rata_rata.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Tahun Lulus {requiredMark}</label>
            <input className={inputClass} type="number" {...register("tahun_lulus")} />
            {errors.tahun_lulus && <p className={errorClass}>{errors.tahun_lulus.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Jurusan yang Diminati {requiredMark}</label>
            <div className="mt-1 flex gap-4">
              {["IPA", "IPS", "Bahasa"].map((j) => (
                <label key={j} className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value={j} className="h-4 w-4" {...register("jurusan_diminati")} /> {j}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Catatan Tambahan (opsional)</label>
            <textarea
              className={inputClass}
              rows={2}
              placeholder="Prestasi, kebutuhan khusus, atau info lain (opsional)"
              {...register("catatan")}
            />
          </div>
        </div>
      )}

      {/* Step 3: Konfirmasi */}
      {step === 3 && (
        <div className="animate-fade-in space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Nama</dt>
                <dd className="font-medium text-slate-800">{values.nama || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Email</dt>
                <dd className="font-medium text-slate-800">{values.email || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">No Telepon</dt>
                <dd className="font-medium text-slate-800">{values.no_telepon || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Asal Sekolah</dt>
                <dd className="font-medium text-slate-800">{values.asal_sekolah || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Nilai Rata-rata</dt>
                <dd className="font-medium text-slate-800">{String(values.nilai_rata_rata ?? "-")}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Jurusan Diminati</dt>
                <dd className="font-medium text-slate-800">{values.jurusan_diminati}</dd>
              </div>
            </dl>
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300" {...register("agree")} />
            Saya menyetujui syarat dan ketentuan pendaftaran calon siswa baru.
          </label>
          {errors.agree && <p className={errorClass}>{errors.agree.message}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            Lanjut
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Daftar Sekarang
          </button>
        )}
      </div>
    </form>
  );
}
