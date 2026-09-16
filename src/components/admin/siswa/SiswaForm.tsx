"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { generatePassword } from "@/lib/text";
import type { SiswaRow } from "@/components/admin/siswa/SiswaTable";

type KelasOption = { id: string; nama: string };

// Client-side shape covers both create and edit; nisn/password rules loosen for edit
// (nisn is immutable and disabled in the form, password is optional when unchanged).
// The API applies the authoritative siswaCreateSchema/siswaUpdateSchema server-side.
const formSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  nisn: z.string().regex(/^\d{10}$/, "NISN harus 10 digit angka"),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").optional().or(z.literal("")),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"]),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  no_telepon: z.string().min(8, "Nomor telepon tidak valid"),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
  orang_tua_nama: z.string().min(1, "Nama orang tua wajib diisi"),
  orang_tua_email: z.string().email("Format email orang tua tidak valid"),
  orang_tua_telepon: z.string().min(8, "Nomor telepon orang tua tidak valid"),
});

type FormValues = z.infer<typeof formSchema>;

export function SiswaForm({
  open,
  onOpenChange,
  siswa,
  kelasOptions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siswa: SiswaRow | null;
  kelasOptions: KelasOption[];
  onSaved: () => void;
}) {
  const isEdit = !!siswa;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      if (siswa) {
        reset({
          nama: siswa.nama,
          nisn: siswa.nisn,
          nik: siswa.nik,
          email: siswa.user.email,
          password: "",
          tempat_lahir: siswa.tempat_lahir,
          tanggal_lahir: siswa.tanggal_lahir.slice(0, 10),
          jenis_kelamin: siswa.jenis_kelamin as "L" | "P",
          alamat: siswa.alamat,
          no_telepon: siswa.no_telepon,
          kelasId: siswa.kelasId,
          orang_tua_nama: siswa.orang_tua_nama,
          orang_tua_email: siswa.orang_tua_email,
          orang_tua_telepon: siswa.orang_tua_telepon,
        });
      } else {
        reset({
          nama: "",
          nisn: "",
          nik: "",
          email: "",
          password: generatePassword(),
          tempat_lahir: "",
          tanggal_lahir: "",
          jenis_kelamin: "L",
          alamat: "",
          no_telepon: "",
          kelasId: kelasOptions[0]?.id ?? "",
          orang_tua_nama: "",
          orang_tua_email: "",
          orang_tua_telepon: "",
        });
      }
    }
  }, [open, siswa, kelasOptions, reset]);

  const onSubmit = async (values: FormValues) => {
    const url = isEdit ? `/api/admin/siswa/${siswa!.id}` : "/api/admin/siswa";
    const method = isEdit ? "PUT" : "POST";

    const payload = { ...values };
    if (isEdit && !payload.password) {
      delete (payload as Partial<FormValues>).password;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyimpan data siswa");
      return;
    }

    toast.success(json.message || "Data siswa berhasil disimpan");
    onOpenChange(false);
    onSaved();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const errorClass = "mt-1 text-xs text-red-600";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={isEdit ? "Edit Siswa" : "Tambah Siswa"}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nama</label>
              <input className={inputClass} {...register("nama")} />
              {errors.nama && <p className={errorClass}>{errors.nama.message}</p>}
            </div>
            <div>
              <label className={labelClass}>NISN</label>
              <input className={inputClass} disabled={isEdit} {...register("nisn")} />
              {errors.nisn && <p className={errorClass}>{errors.nisn.message}</p>}
            </div>

            <div>
              <label className={labelClass}>NIK</label>
              <input className={inputClass} {...register("nik")} />
              {errors.nik && <p className={errorClass}>{errors.nik.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" {...register("email")} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
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
                    title="Generate password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.password && <p className={errorClass}>{errors.password.message}</p>}
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
              <label className={labelClass}>Tempat Lahir</label>
              <input className={inputClass} {...register("tempat_lahir")} />
              {errors.tempat_lahir && <p className={errorClass}>{errors.tempat_lahir.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Tanggal Lahir</label>
              <input className={inputClass} type="date" {...register("tanggal_lahir")} />
              {errors.tanggal_lahir && <p className={errorClass}>{errors.tanggal_lahir.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Jenis Kelamin</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value="L" {...register("jenis_kelamin")} /> Laki-laki
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value="P" {...register("jenis_kelamin")} /> Perempuan
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>No Telepon</label>
              <input className={inputClass} {...register("no_telepon")} />
              {errors.no_telepon && <p className={errorClass}>{errors.no_telepon.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Alamat</label>
              <textarea className={inputClass} rows={2} {...register("alamat")} />
              {errors.alamat && <p className={errorClass}>{errors.alamat.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Nama Orang Tua</label>
              <input className={inputClass} {...register("orang_tua_nama")} />
              {errors.orang_tua_nama && <p className={errorClass}>{errors.orang_tua_nama.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email Orang Tua</label>
              <input className={inputClass} type="email" {...register("orang_tua_email")} />
              {errors.orang_tua_email && <p className={errorClass}>{errors.orang_tua_email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>No Telepon Orang Tua</label>
              <input className={inputClass} {...register("orang_tua_telepon")} />
              {errors.orang_tua_telepon && <p className={errorClass}>{errors.orang_tua_telepon.message}</p>}
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
