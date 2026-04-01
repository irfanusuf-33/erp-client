"use client";
import { useState, useEffect } from "react";
import BaseTable from "@/components/shared/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";

interface Enquery {
  _id?: string;
  noteId?: string;
  note:string;
  source: string;
  noteDate:string;
  assignedTo:string;
  type:string
  createdAt?: string;
  status:boolean
}

type PaginationState = { pageIndex: number; pageSize: number };

export default function ViewEnquiry() {
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const enqueries: Enquery[] = [
    {noteId:'2567780', note:'John' , source:'meeting', noteDate:'12/12/2023', assignedTo:'Voctrum', type:'manual', createdAt:'21/03/2026', status:true},
    {noteId:'2567781', note:'Smith' , source:'meeting', noteDate:'12/12/2023', assignedTo:'Voctrum', type:'manual', createdAt:'21/03/2026', status:false},
    {noteId:'2567782', note:'Doe' , source:'meeting', noteDate:'12/12/2023', assignedTo:'Voctrum', type:'manual', createdAt:'21/03/2026', status:true},
    {noteId:'2567783', note:'Bash' , source:'meeting', noteDate:'12/12/2023', assignedTo:'Voctrum', type:'manual', createdAt:'21/03/2026', status:false},
    {noteId:'2567784', note:'Will' , source:'meeting', noteDate:'12/12/2023', assignedTo:'Voctrum', type:'manual', createdAt:'21/03/2026', status:true},
    {noteId:'2567785', note:'Tiger' , source:'meeting', noteDate:'12/12/2023', assignedTo:'Voctrum', type:'manual', createdAt:'21/03/2026', status:false},
  ]


    const columns: MRT_ColumnDef<Enquery>[] = enqueries.length > 0 
    ? Object.keys(enqueries[0]).filter(key => key !== '_id').map((key) => {
        if (key === 'noteId') {
          return {
            accessorKey: key,
            header: 'Note ID',
            Cell: ({ row }) => (
              <span
              >
                {row.original.noteId}
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
      label: (selectedEnqueries: Enquery[]) => {
        if (selectedEnqueries.length === 0) return 'Toggle Status';
        const allDisabled = selectedEnqueries.every(c => !c.status);
        const allEnabled = selectedEnqueries.every(c => c.status);
        if (allDisabled) return 'Enable';
        if (allEnabled) return 'Disable';
        return 'Toggle Status';
      },
      onClick: (selectedEnqueries: Enquery[]) => {
        if (selectedEnqueries.length > 0) {
          // 
        }
      },
    },
  ];


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Notes Management</h2>

      <BaseTable
        data={enqueries}
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
        getRowId={(row) => row.noteId || row._id || ""}
      />
    </div>
  );
}
