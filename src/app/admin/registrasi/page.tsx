"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type RegistrasiRow = {
  id: string;
  nama: string;
  email: string;
  no_telepon: string;
  asal_sekolah: string;
  nilai_rata_rata: number;
  tahun_lulus: number;
  jurusan_diminati: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
};

const statusBadge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
};

export default function AdminRegistrasiPage() {
  const [data, setData] = useState<RegistrasiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<RegistrasiRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrasi");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      toast.error("Gagal memuat data registrasi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (row: RegistrasiRow) => {
    const res = await fetch(`/api/admin/registrasi/${row.id}/approve`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menyetujui pendaftaran");
      return;
    }
    toast.success(json.message);
    load();
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const res = await fetch(`/api/admin/registrasi/${rejectTarget.id}/reject`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menolak pendaftaran");
      return;
    }
    toast.success(json.message);
    load();
  };

  const columns = useMemo<ColumnDef<RegistrasiRow, unknown>[]>(
    () => [
      { accessorKey: "nama", header: "Nama" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "asal_sekolah", header: "Asal Sekolah" },
      { accessorKey: "jurusan_diminati", header: "Jurusan" },
      { accessorKey: "nilai_rata_rata", header: "Nilai Rata-rata" },
      {
        id: "verified",
        header: "Email Terverifikasi",
        accessorFn: (row) => (row.isVerified ? "Ya" : "Belum"),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[row.original.status]}`}>
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.status === "pending" ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleApprove(row.original)}
                disabled={!row.original.isVerified}
                title={!row.original.isVerified ? "Email belum diverifikasi" : "Setujui"}
                className="rounded-md p-1.5 text-slate-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setRejectTarget(row.original)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                title="Tolak"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Registrasi Calon Siswa</h1>
      <p className="mt-1 text-sm text-slate-500">{data.length} pendaftar</p>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari nama, email..."
          emptyMessage="Belum ada pendaftaran."
        />
      </div>

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        title="Tolak Pendaftaran"
        confirmLabel="Tolak"
        description={`Yakin ingin menolak pendaftaran "${rejectTarget?.nama}"?`}
        onConfirm={handleReject}
      />
    </div>
  );
}
