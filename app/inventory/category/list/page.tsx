"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = { _id: string; enabled: boolean; description: string; categoryName: string; categoryId: string };

export default function InventoryCategoryList() {
  const router = useRouter();
  const { getAllCategories, toggleCategoryStatus } = useGlobalStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const limit = 10;

  const fetchCategories = async () => {
    setLoading(true);
    // getAllCategories returns { success, data: { items[], totalItems, pages } }
    const result = await getAllCategories(page, limit, globalFilter);
    if (result.success) {
      setCategories(result.data?.items || []);
      setRowCount(result.data?.totalItems || 0);
    } else {
      setCategories([]); setRowCount(0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [page, globalFilter]);

  const handleToggleStatus = async () => {
    if (selected.length === 0) return;
    const selectedCats = categories.filter((c) => selected.includes(c.categoryId));
    await Promise.all(selectedCats.map((cat) => toggleCategoryStatus(cat.categoryId)));
    setCategories((prev) => prev.map((c) => selected.includes(c.categoryId) ? { ...c, enabled: !c.enabled } : c));
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === categories.length ? [] : categories.map((c) => c.categoryId));

  const totalPages = Math.ceil(rowCount / limit);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Category List</h2>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 gap-3">
          <Input
            type="text"
            placeholder="Search categories..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); setPage(1); }}
            className="w-64"
          />
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleToggleStatus}>Toggle Status</Button>
            )}
            <Button size="sm" onClick={() => router.push("/inventory/category/create")}>Create Category</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === categories.length && categories.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No categories found</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.categoryId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(cat.categoryId)} onChange={() => toggleSelect(cat.categoryId)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="cursor-pointer text-blue-600 underline" onClick={() => router.push(`/inventory/category/detail/${cat.categoryId}`)}>
                        {cat.categoryId}
                      </span>
                    </td>
                    <td className="px-4 py-3">{cat.categoryName}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{cat.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {cat.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/category/edit/${cat.categoryId}`)}>Edit</Button>
                    </td>
                  </tr>
                ))
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
