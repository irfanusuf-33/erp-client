"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/shared/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import { Trash2, FileText } from "lucide-react";

type Template = {
  templateId: string;
  description?: string;
  createdAt?: string;
};

type PaginationState = { pageIndex: number; pageSize: number };

export default function InventoryTemplateList() {
  const router = useRouter();
  const { getTemplates, deleteTemplate } = useGlobalStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    const page = pagination.pageIndex + 1;
    const limit = pagination.pageSize;
    const response = await getTemplates(page, limit, globalFilter);
    if (response.success) {
      const inner = response.data?.data || {};
      setTemplates(inner.items || []);
      setRowCount(inner.totalItems || 0);
    } else {
      setTemplates([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const columns: MRT_ColumnDef<Template, any>[] = [
    { accessorKey: "templateId", header: "Template ID" },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleDateString() : "—";
      },
    },
  ];

  const rowActions = [
    {
      label: "Use Template",
      icon: <FileText size={16} />,
      onClick: (rows: Template[]) => {
        if (rows.length === 1) {
          router.push(`/inventory/product/create?templateId=${rows[0].templateId}`);
        }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: async (rows: Template[]) => {
        if (rows.length === 1) {
          if (confirm(`Delete template "${rows[0].templateId}"?`)) {
            await deleteTemplate(rows[0].templateId);
            fetchTemplates();
          }
        }
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Inventory Templates</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Manage and reuse product templates</p>
        </div>
      </div>

      <BaseTable
        data={templates}
        columns={columns}
        enableRowActions
        rowActions={rowActions}
        isLoading={loading}
        manualPagination
        rowCount={rowCount}
        state={{ pagination, globalFilter }}
        onPaginationChange={setPagination}
        onGlobalFilterChange={setGlobalFilter}
        onExportRows={() => {}}
        getRowId={(row) => row.templateId}
      />
    </div>
  );
}
