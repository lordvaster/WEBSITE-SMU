"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export type GuruRow = {
  id: string;
  nip: string;
  nama: string;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  mata_pelajaran: string[];
  alamat: string;
  no_telepon: string;
  user: { email: string; isActive: boolean };
};

function fullName(row: GuruRow) {
  return [row.gelar_depan, row.nama].filter(Boolean).join(" ") + (row.gelar_belakang ? `, ${row.gelar_belakang}` : "");
}

export function GuruTable({
  data,
  loading,
  onEdit,
  onDelete,
  toolbarActions,
}: {
  data: GuruRow[];
  loading: boolean;
  onEdit: (row: GuruRow) => void;
  onDelete: (row: GuruRow) => void;
  toolbarActions: React.ReactNode;
}) {
  const columns = useMemo<ColumnDef<GuruRow, unknown>[]>(
    () => [
      { accessorKey: "nip", header: "NIP" },
      {
        id: "nama",
        header: "Nama",
        accessorFn: fullName,
      },
      {
        id: "mata_pelajaran",
        header: "Mata Pelajaran",
        accessorFn: (row) => row.mata_pelajaran.join(", "),
      },
      { accessorKey: "no_telepon", header: "No Telepon" },
      {
        id: "email",
        header: "Email",
        accessorFn: (row) => row.user.email,
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
      searchPlaceholder="Cari nama, NIP, email, mata pelajaran..."
      emptyMessage="Belum ada data guru."
      toolbarActions={toolbarActions}
    />
  );
}
