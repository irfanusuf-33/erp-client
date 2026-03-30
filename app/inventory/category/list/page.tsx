"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import { CheckCircle, XCircle, Edit } from "lucide-react";

type Category = {
  _id: string;
  enabled: boolean;
  description: string;
  categoryName: string;
  categoryId: string;
};

type PaginationState = { pageIndex: number; pageSize: number };

export default function InventoryCategoryList() {
  const router = useRouter();
  const { getAllCategories, toggleCategoryStatus } = useGlobalStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const page = pagination.pageIndex + 1;
    const limit = pagination.pageSize;
    const result = await getAllCategories(page, limit, globalFilter);
    if (result.success) {
      setCategories(result.data?.items || []);
      setRowCount(result.data?.totalItems || 0);
    } else {
      setCategories([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const columns: MRT_ColumnDef<Category, any>[] = [
    {
      accessorKey: "categoryId",
      header: "Category ID",
      Cell: ({ row }) => (
        <span
          className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => router.push(`/inventory/category/detail/${row.original.categoryId}`)}
        >
          {row.original.categoryId}
        </span>
      ),
    },
    { accessorKey: "categoryName", header: "Category Name" },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ cell }) => <span className="max-w-xs truncate block">{cell.getValue<string>()}</span>,
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
      label: "Toggle Status",
      onClick: async (selected: Category[]) => {
        await Promise.all(selected.map((cat) => toggleCategoryStatus(cat.categoryId)));
        fetchCategories();
      },
    },
  ];

  const rowActions = [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: (rows: Category[]) => {
        if (rows.length === 1) {
          router.push(`/inventory/category/edit/${rows[0].categoryId}`);
        }
      },
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Category List</h2>

      <BaseTable
        data={categories}
        columns={columns}
        enableRowSelection
        enableRowActions
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        isLoading={loading}
        manualPagination
        rowCount={rowCount}
        state={{ pagination, globalFilter }}
        onPaginationChange={setPagination}
        onGlobalFilterChange={setGlobalFilter}
        onExportRows={() => {}}
        getRowId={(row) => row.categoryId}
      />
    </div>
  );
}
