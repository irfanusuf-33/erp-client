"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { XCircle, CheckCircle, Info } from "lucide-react";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import type { IamUserRow } from "@/types/iam.types";

type PaginationState = { pageIndex: number; pageSize: number };

function PoliciesCell({ policies }: { policies: string[] }) {
  const [open, setOpen] = useState(false);
  if (!policies?.length) return <span className="text-gray-400">-</span>;
  const visible = policies.slice(0, 2);
  const extra = policies.length - 2;
  return (
    <>
      <div className="flex flex-wrap gap-1 items-center">
        {visible.map((p) => <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{p}</span>)}
        {extra > 0 && (
          <button onClick={() => setOpen(true)} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">+{extra}</button>
        )}
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-800">All Policies</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto max-h-80 px-6 pb-5">
              <div className="flex flex-wrap gap-2">
                {policies.map((p) => <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{p}</span>)}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function IamUsers() {
  const { getUsers, users, iamLoading, toggleUserStatus } = useGlobalStore();
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    getUsers(pagination.pageIndex + 1, pagination.pageSize).then((res) => {
      if (res?.count) setRowCount(res.count);
    });
  }, [pagination.pageIndex, pagination.pageSize]);

  const columns: MRT_ColumnDef<IamUserRow, any>[] = [
    { accessorKey: "fName", header: "Name", Cell: ({ row }) => <span>{[row.original.fName, row.original.lName].filter(Boolean).join(" ") || "-"}</span> },
    {
      accessorKey: "email", header: "Email",
      Cell: ({ row }) => (
        <Link href={`/iam/users/${row.original.email}`} className="text-blue-600 hover:underline cursor-pointer">{row.original.email}</Link>
      ),
    },
    { accessorKey: "passwordAge", header: "Password Age", Cell: ({ cell }) => <span>{(cell.getValue() as string) || "-"}</span> },
    {
      accessorKey: "lastLogin", header: "Last Login",
      Cell: ({ cell }) => { const v = cell.getValue<string>(); return v ? new Date(v).toLocaleString("en-GB") : "-"; },
    },
    {
      accessorKey: "forceMfa", header: "MFA",
      Cell: ({ cell }) => <span className="text-sm text-gray-700">{cell.getValue() ? "True" : "False"}</span>,
    },
    {
      accessorKey: "policies", header: "Policies",
      Cell: ({ cell }) => <PoliciesCell policies={cell.getValue() as string[]} />,
    },
    {
      accessorKey: "disabled", header: "Status",
      Cell: ({ cell }) => cell.getValue() ? (
        <div className="flex items-center gap-1.5"><XCircle size={16} className="text-red-600" /><span className="text-red-600">Disabled</span></div>
      ) : (
        <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-700" /><span className="text-green-700">Active</span></div>
      ),
    },
  ];

  const toolbarActions = [
    {
      label: (selectedUsers: IamUserRow[]) => selectedUsers.every((u) => u.disabled) ? "Enable" : "Disable",
      onClick: async (selectedUsers: IamUserRow[]) => {
        for (const user of selectedUsers) await toggleUserStatus(user._id as any);
        getUsers(pagination.pageIndex + 1, pagination.pageSize).then((res) => {
          if (res?.count) setRowCount(res.count);
        });
      },
    },
  ];

  return (
    <div className="px-6 py-7">
      <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
        User Management
        <div className="relative group flex items-center ml-2">
          <Info size={16} className="cursor-pointer text-gray-500" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
            <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
            <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">
              An Identity And Access Management User is an identity that manage employee profiles, roles and access permissions.
            </div>
          </div>
        </div>
      </h2>

      <BaseTable
        data={users as IamUserRow[]}
        columns={columns}
        enableRowSelection
        toolbarActions={toolbarActions}
        isLoading={iamLoading}
        manualPagination
        rowCount={rowCount}
        state={{ pagination }}
        onPaginationChange={setPagination}
        onExportRows={() => {}}
      />
    </div>
  );
}
