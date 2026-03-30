"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/shared/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import { CheckCircle, XCircle, Edit } from "lucide-react";

interface Warehouse {
  _id: string;
  name: string;
  city: string;
  state: string;
  unitNumber: string;
  warehouseId: string;
  enabled?: boolean;
}

export default function InventoryWarehouseList() {
  const router = useRouter();
  const { getAllWarehouses, searchWarehouses, toggleWarehouseStatus } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");

  const loadWarehouses = async () => {
    setLoading(true);
    if (globalFilter) {
      const result = await searchWarehouses(globalFilter);
      if (result.success) {
        const items = result.data || [];
        setWarehouses(items);
        setRowCount(items.length);
      } else {
        setWarehouses([]);
        setRowCount(0);
      }
    } else {
      const result = await getAllWarehouses();
      if (result.success) {
        const items = result.data?.data?.items || [];
        setWarehouses(items);
        setRowCount(result.data?.data?.totalItems || items.length);
      } else {
        setWarehouses([]);
        setRowCount(0);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWarehouses();
  }, [globalFilter]);

  const columns: MRT_ColumnDef<Warehouse, any>[] = [
    {
      accessorKey: "warehouseId",
      header: "Warehouse ID",
      Cell: ({ row }) => (
        <span
          className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() =>
            router.push(`/inventory/warehouse/warehouseDetail/${row.original.warehouseId}`)
          }
        >
          {row.original.warehouseId}
        </span>
      ),
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "address",
      header: "Address",
      Cell: ({ row }) => {
        const address = [row.original.unitNumber, row.original.city, row.original.state]
          .filter(Boolean)
          .join(", ");
        return <span>{address}</span>;
      },
    },
    {
      accessorKey: "enabled",
      header: "Status",
      Cell: ({ cell }) =>
        cell.getValue() ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={16} className="text-green-700 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-400">Enabled</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <XCircle size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">Disabled</span>
          </div>
        ),
    },
  ];

  const toolbarActions = [
    {
      label: (selected: Warehouse[]) =>
        selected.every((w) => !w.enabled) ? "Enable" : "Disable",
      onClick: async (selected: Warehouse[]) => {
        const ids = selected.map((w) => w.warehouseId);
        await toggleWarehouseStatus(ids);
        loadWarehouses();
      },
    },
  ];

  const rowActions = [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: (rows: Warehouse[]) => {
        if (rows.length === 1) {
          router.push(`/inventory/warehouse/edit/${rows[0].warehouseId}`);
        }
      },
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Warehouse List
      </h2>

      <BaseTable
        data={warehouses}
        columns={columns}
        enableRowSelection
        enableRowActions
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        isLoading={loading}
        state={{ globalFilter }}
        onGlobalFilterChange={setGlobalFilter}
        onExportRows={() => {}}
        getRowId={(row) => row.warehouseId}
      />
    </div>
  );
}
