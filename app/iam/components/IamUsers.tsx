"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { XCircle, CheckCircle, Info } from "lucide-react";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import type { IamUserRow } from "@/types/iam.types";

type PaginationState = { pageIndex: number; pageSize: number };

const columns: MRT_ColumnDef<IamUserRow, any>[] = [
  { accessorKey: "fName", header: "First Name", Cell: ({ cell }) => <span>{(cell.getValue() as string) || "-"}</span> },
  { accessorKey: "lName", header: "Last Name", Cell: ({ cell }) => <span>{(cell.getValue() as string) || "-"}</span> },
  {
    accessorKey: "email",
    header: "Username",
    Cell: ({ row }) => (
      <Link href={`/iam/users/${row.original.email}`} className="text-blue-600 hover:underline cursor-pointer">
        {row.original.email}
      </Link>
    ),
  },
  { accessorKey: "passwordAge", header: "Password Age", Cell: ({ cell }) => <span>{(cell.getValue() as string) || "-"}</span> },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value ? new Date(value).toLocaleString("en-GB") : "-";
    },
  },
  {
    accessorKey: "disabled",
    header: "Status",
    Cell: ({ cell }) =>
      cell.getValue() ? (
        <div className="flex items-center gap-1.5"><XCircle size={16} className="text-red-600" /><span className="text-red-600">Disabled</span></div>
      ) : (
        <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-700" /><span className="text-green-700">Active</span></div>
      ),
  },
];

export default function IamUsers() {
  const { getUsers, users, iamLoading, toggleUserStatus } = useGlobalStore();
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    getUsers(pagination.pageIndex + 1, pagination.pageSize).then((res) => {
      if (res?.count) setRowCount(res.count);
    });
  }, [pagination.pageIndex, pagination.pageSize]);

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
