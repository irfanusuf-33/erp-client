"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/shared/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import { Plus } from "lucide-react";

interface Client {
  _id?: string;
  legalName?: string;
  clientId: string;
  isActive?: boolean;
  createdAt?: string;
}

type PaginationState = { pageIndex: number; pageSize: number };

export default function ManageClients() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // const [products, setProducts] = useState<Product[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const clients: Client[] = [
    {legalName:'John', clientId:'2567789' , isActive:true, createdAt:'12/12/2023'},
    {legalName:'Smith', clientId:'2567780' , isActive:false, createdAt:'12/12/2023'},
    {legalName:'Will', clientId:'2567783' , isActive:true, createdAt:'12/12/2023'},
    {legalName:'David', clientId:'2567782' , isActive:true, createdAt:'12/12/2023'},
    {legalName:'Michael', clientId:'2567785' , isActive:false, createdAt:'12/12/2023'},
    {legalName:'Chris', clientId:'2567787' , isActive:true, createdAt:'12/12/2023'}
  ]


    const columns: MRT_ColumnDef<Client>[] = clients.length > 0 
    ? Object.keys(clients[0]).filter(key => key !== '_id').map((key) => {
        if (key === 'clientId') {
          return {
            accessorKey: key,
            header: 'Client ID',
            Cell: ({ row }) => (
              <span
                onClick={() => router.push(`/crm/client-detail/${row.original.clientId}`)}
                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
              >
                {row.original.clientId}
              </span>
            ),
          };
        }
        if (key === 'createdAt') {
          return {
            accessorKey: key,
            header: 'Date',
            Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
          };
        }
        if (key === 'isActive') {
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
      label: (selectedClients: Client[]) => {
        if (selectedClients.length === 0) return 'Toggle Status';
        const allDisabled = selectedClients.every(c => !c.isActive);
        const allEnabled = selectedClients.every(c => c.isActive);
        if (allDisabled) return 'Enable';
        if (allEnabled) return 'Disable';
        return 'Toggle Status';
      },
      onClick: (selectedClients: Client[]) => {
        if (selectedClients.length > 0) {
          // 
        }
      },
    },
  ];

 const toolbarQuickActions = [
    {
      label: 'Add Client',
      icon: <Plus />,
      onClick: ()=>router.push('/crm/add-client'),
      alwaysEnabled: true
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Manage Clients</h2>

      <BaseTable
        data={clients}
        columns={columns}
        enableRowSelection
        toolbarActions={toolbarActions}
        toolbarQuickActions={toolbarQuickActions}
        isLoading={loading}
        manualPagination
        rowCount={rowCount}
        state={{ pagination, globalFilter }}
        onPaginationChange={setPagination}
        onGlobalFilterChange={setGlobalFilter}
        onExportRows={() => {}}
        getRowId={(row) => row.clientId || row._id || ""}
      />
    </div>
  );
}
