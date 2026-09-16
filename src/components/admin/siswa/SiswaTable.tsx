"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export type SiswaRow = {
  id: string;
  nisn: string;
  nama: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  no_telepon: string;
  kelasId: string;
  orang_tua_nama: string;
  orang_tua_email: string;
  orang_tua_telepon: string;
  createdAt: string;
  kelas: { nama: string };
  user: { email: string; isActive: boolean };
};

export function SiswaTable({
  data,
  loading,
  onEdit,
  onDelete,
  toolbarActions,
}: {
  data: SiswaRow[];
  loading: boolean;
  onEdit: (row: SiswaRow) => void;
  onDelete: (row: SiswaRow) => void;
  toolbarActions: React.ReactNode;
}) {
  const columns = useMemo<ColumnDef<SiswaRow, unknown>[]>(
    () => [
      { accessorKey: "nisn", header: "NISN" },
      { accessorKey: "nama", header: "Nama" },
      {
        id: "kelas",
        header: "Kelas",
        accessorFn: (row) => row.kelas.nama,
      },
      { accessorKey: "no_telepon", header: "No Telepon" },
      {
        id: "email",
        header: "Email",
        accessorFn: (row) => row.user.email,
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => (row.user.isActive ? "Active" : "Inactive"),
        cell: ({ row }) => (
          <span
            className={
              row.original.user.isActive
                ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600"
                : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
            }
          >
            {row.original.user.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(row.original)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      searchPlaceholder="Cari nama, NISN, email, kelas..."
      emptyMessage="Belum ada data siswa."
      toolbarActions={toolbarActions}
    />
  );
}
