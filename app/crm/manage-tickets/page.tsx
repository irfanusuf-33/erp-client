"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/shared/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";

interface Ticket {
  _id?: string;
  fName?: string;
  lName: string;
  username?: string;
  mfa?: string;
  passwordAge:number;
  lastLogin:string;
  status:boolean
}

type PaginationState = { pageIndex: number; pageSize: number };

export default function ManageTickets() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const tickets: Ticket[] = [
    {fName:'John', lName:'Smith' , username:'jon.smith@abc.com', mfa:'Biometric', passwordAge:22, lastLogin:'23/11/2025' , status:true},
    {fName:'Will', lName:'Smash' , username:'jon.doe@abc.com', mfa:'Biometric', passwordAge:22, lastLogin:'23/11/2025' , status:false},
    {fName:'Bash', lName:'Smith' , username:'jon.will@abc.com', mfa:'Biometric', passwordAge:22, lastLogin:'23/11/2025' , status:true},
    {fName:'Dow', lName:'Smith' , username:'jon.smash@abc.com', mfa:'Biometric', passwordAge:22, lastLogin:'23/11/2025' , status:false},
    {fName:'Luis', lName:'Smith' , username:'jon.luice@abc.com', mfa:'Biometric', passwordAge:22, lastLogin:'23/11/2025' , status:true},

    
  ]


    const columns: MRT_ColumnDef<Ticket>[] = tickets.length > 0 
    ? Object.keys(tickets[0]).filter(key => key !== '_id').map((key) => {
        if (key === 'fName') {
          return {
            accessorKey: key,
            header: 'First Name',
            Cell: ({ row }) => (
              <span>
                {row.original.fName}
              </span>
            ),
          };
        }
        if (key === 'lName') {
          return {
            accessorKey: key,
            header: 'Last Name',
            Cell: ({ row }) => (
              <span>
                {row.original.lName}
              </span>
            ),
          };
        }
        if (key === 'username') {
          return {
            accessorKey: key,
            header: 'Username',
            Cell: ({ row }) => (
              <span
                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
              >
                {row.original.username}
              </span>
            ),
          };
        }
        if (key === 'passwordAge') {
          return {
            accessorKey: key,
            header: 'Password Age',
            Cell: ({ row }) => (
              <span>
                {row.original.username + ' days'} 
              </span>
            ),
          };
        }
        if (key === 'lastLogin') {
          return {
            accessorKey: key,
            header: 'Last Login',
            Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
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
      label: (selectedTickets: Ticket[]) => {
        if (selectedTickets.length === 0) return 'Toggle Status';
        const allDisabled = selectedTickets.every(c => !c.status);
        const allEnabled = selectedTickets.every(c => c.status);
        if (allDisabled) return 'Enable';
        if (allEnabled) return 'Disable';
        return 'Toggle Status';
      },
      onClick: (selectedTickets: Ticket[]) => {
        if (selectedTickets.length > 0) {
          // 
        }
      },
    },
  ];


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Manage Tickets</h2>

      <BaseTable
        data={tickets}
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
        getRowId={(row) => row.username || row._id || ""}
      />
    </div>
  );
}
