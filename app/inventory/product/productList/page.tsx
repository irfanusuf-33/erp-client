"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import { CheckCircle, XCircle } from "lucide-react";

interface Product {
  _id?: string;
  productId?: string;
  name: string;
  pricingDetails?: Array<{ currency?: string; price?: number; costPrice?: number; cutOffPrice?: number }>;
  category: string | string[];
  enable?: boolean;
  enabled?: boolean;
  stockStatus?: string;
  inventory?: { ats?: number };
}

type PaginationState = { pageIndex: number; pageSize: number };

const getStockStatus = (ats: number) => {
  if (ats === 0) return "OutOfStock";
  if (ats <= 10) return "LowStock";
  return "HighStock";
};

export default function InventoryProductList() {
  const router = useRouter();
  const { getProducts, advancedSearchProducts, toggleProductStatus } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const response = globalFilter
        ? await advancedSearchProducts({ search: globalFilter, page, limit })
        : await getProducts({ page, limit });
      const items = response?.data?.items || [];
      const total = response?.data?.totalItems || items.length;
      setProducts(items);
      setRowCount(total);
    } catch {
      setProducts([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const columns: MRT_ColumnDef<Product, any>[] = [
    {
      accessorKey: "productId",
      header: "Product ID",
      Cell: ({ row }) => {
        const id = row.original.productId || row.original._id || "";
        return (
          <span
            className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => router.push(`/inventory/product/productDetails/${id}`)}
          >
            {id}
          </span>
        );
      },
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "pricingDetails",
      header: "Price",
      Cell: ({ row }) => {
        const firstPrice = row.original.pricingDetails?.[0]?.price ?? "0.00";
        return <span>${firstPrice}</span>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      Cell: ({ row }) => {
        const category = Array.isArray(row.original.category)
          ? row.original.category.join(", ")
          : row.original.category;
        return <span>{category}</span>;
      },
    },
    {
      accessorKey: "enable",
      header: "Enabled",
      Cell: ({ row }) => {
        const isEnabled = row.original.enable || row.original.enabled;
        return isEnabled ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={16} className="text-green-700 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-400">Enabled</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <XCircle size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">Disabled</span>
          </div>
        );
      },
    },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      Cell: ({ row }) => {
        const stockStatus = row.original.stockStatus || getStockStatus(row.original.inventory?.ats || 0);
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              stockStatus === "HighStock"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : stockStatus === "LowStock"
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {stockStatus}
          </span>
        );
      },
    },
  ];

  const toolbarActions = [
    {
      label: (selected: Product[]) =>
        selected.every((p) => !(p.enable || p.enabled)) ? "Enable" : "Disable",
      onClick: async (selected: Product[]) => {
        const ids = selected.map((p) => p.productId || p._id).filter(Boolean) as string[];
        await toggleProductStatus(ids);
        loadProducts();
      },
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Product List</h2>

      <BaseTable
        data={products}
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
        getRowId={(row) => row.productId || row._id || ""}
      />
    </div>
  );
}
