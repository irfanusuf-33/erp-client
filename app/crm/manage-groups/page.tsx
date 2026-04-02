"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/shared/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";

interface Group {
  _id?: string;
  groupName?: string;
  description: string;
  createdBy?: string;
  createdAt?: string;
  status:boolean
}

type PaginationState = { pageIndex: number; pageSize: number };

export default function ManageGroups() {

  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const groups: Group[] = [
    {_id:'132',groupName:'voctrum123', description:'heyhas' , createdBy:'jon.smith@abc.com', createdAt:'16/12/2025', status:true},
    {_id:'133', groupName:'voctrum162', description:'heydsa' , createdBy:'jon.doe@abc.com', createdAt:'16/12/2025', status:false},
    {_id:'134',groupName:'voctrum762', description:'heyhas' , createdBy:'jon.bash@abc.com', createdAt:'16/12/2025', status:true},
    {_id:'135',groupName:'voctrum892', description:'heyhas' , createdBy:'jon.will@abc.com', createdAt:'16/12/2025', status:false},
    {_id:'136',groupName:'voctrum989', description:'heyhas' , createdBy:'jon.luice@abc.com', createdAt:'16/12/2025', status:true},
  ]

  const router = useRouter()


    const columns: MRT_ColumnDef<Group>[] = groups.length > 0 
    ? Object.keys(groups[0]).filter(key => key !== '_id').map((key) => {
        if (key === 'groupName') {
          return {
            accessorKey: key,
            header: 'Group Name',
            Cell: ({ row }) => (
              <span 
              className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline" 
              onClick={()=> router.push(`/crm/group-detail/${row.original._id}`)}
              >
                {row.original.groupName}
              </span>
            ),
          };
        }
        if (key === 'status') {
          return {
            accessorKey: key,
            header: 'Status',
            Cell: ({ cell }) => (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  cell.getValue() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {cell.getValue() ? 'Active' : 'Disabled'}
              </span>
            ),
          };
        }
        return {
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        };
      })
    : [];

    const toolbarActions = [
    {
      label: (selectedGroups: Group[]) => {
        if (selectedGroups.length === 0) return 'Toggle Status';
        const allDisabled = selectedGroups.every(c => !c.status);
        const allEnabled = selectedGroups.every(c => c.status);
        if (allDisabled) return 'Enable';
        if (allEnabled) return 'Disable';
        return 'Toggle Status';
      },
      onClick: (selectedGroups: Group[]) => {
        if (selectedGroups.length > 0) {
          // 
        }
      },
    },
  ];


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Manage Groups</h2>

      <BaseTable
        data={groups}
        columns={columns}
        enableRowSelection
        toolbarActions={toolbarActions}
        isLoading={loading}
        manualPagination
        rowCount={rowCount}
        state={{ pagination, globalFilter }}
        onPaginationChange={setPagination}
        onGlobalFilterChange={setGlobalFilter}
        onExportRows={() => {}}
        getRowId={(row) => row.groupName || row._id || ""}
      />
    </div>
  );
}
