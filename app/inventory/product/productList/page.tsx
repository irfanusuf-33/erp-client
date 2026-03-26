"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const limit = 10;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = globalFilter
        ? await advancedSearchProducts({ search: globalFilter, page, limit })
        : await getProducts({ page, limit });
      // getProducts: res.data = { success, data: { items[], totalItems } }
      // advancedSearchProducts: res.data = { success, data: { items[], totalItems } }
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

  useEffect(() => { loadProducts(); }, [page, globalFilter]);

  const handleToggleStatus = async () => {
    if (selected.length === 0) return;
    const selectedProducts = products.filter((p) => selected.includes(p.productId || p._id || ""));
    const allDisabled = selectedProducts.every((p) => !(p.enable || p.enabled));
    const ids = selectedProducts.map((p) => p.productId || p._id).filter(Boolean) as string[];
    await toggleProductStatus(ids);
    setProducts((prev) =>
      prev.map((product) => {
        const id = product.productId || product._id;
        if (ids.includes(id!)) return { ...product, enable: allDisabled, enabled: allDisabled };
        return product;
      })
    );
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p.productId || p._id || ""));

  const totalPages = Math.ceil(rowCount / limit);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 gap-3">
          <Input
            type="text"
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); setPage(1); }}
            className="w-64"
          />
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                {products.filter((p) => selected.includes(p.productId || p._id || "")).every((p) => !(p.enable || p.enabled)) ? "Enable" : "Disable"}
              </Button>
            )}
            <Button size="sm" onClick={() => router.push("/inventory/product/create")}>+ Add Product</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No products found</td></tr>
              ) : (
                products.map((product) => {
                  const id = product.productId || product._id || "";
                  const isEnabled = product.enable || product.enabled;
                  const stockStatus = product.stockStatus || getStockStatus(product.inventory?.ats || 0);
                  const firstPrice = product.pricingDetails?.[0]?.price ?? "0.00";
                  const category = Array.isArray(product.category) ? product.category.join(", ") : product.category;
                  return (
                    <tr key={id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(id)} onChange={() => toggleSelect(id)} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="cursor-pointer text-blue-600 underline" onClick={() => router.push(`/inventory/product/productDetails/${id}`)}>
                          {id}
                        </span>
                      </td>
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3">${firstPrice}</td>
                      <td className="px-4 py-3">{category}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isEnabled ? "Enabled" : "Disabled"}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus === "HighStock" ? "bg-green-100 text-green-700" : stockStatus === "LowStock" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {stockStatus}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
          <span>{rowCount} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="px-3 py-1">{page} / {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
