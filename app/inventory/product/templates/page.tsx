"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryTemplateList() {
  const router = useRouter();
  const { getTemplates, deleteTemplate } = useGlobalStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { fetchTemplates(currentPage); }, [currentPage, debouncedQuery]);

  const fetchTemplates = async (page = 1) => {
    setLoading(true);
    const response = await getTemplates(page, itemsPerPage, debouncedQuery);
    if (response.success) {
      // slice returns { success, data: res.data }
      // res.data (axios) = { success, data: { items[], pages, totalItems } }
      const inner = response.data?.data || {};
      setTemplates(inner.items || []);
      setTotalPages(inner.pages || 1);
      setTotalItems(inner.totalItems || 0);
      setCurrentPage(page);
    }
    setLoading(false);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm(`Delete template "${templateId}"?`)) return;
    await deleteTemplate(templateId);
    fetchTemplates(currentPage);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Templates</h1>
          <p className="text-sm text-gray-500">Manage and reuse product templates</p>
        </div>
        <Button size="sm" onClick={() => router.push("/inventory/product/create")}>+ Add Product</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Template ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Created At</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : templates.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No templates found</td></tr>
              ) : (
                templates.map((template: any) => (
                  <tr key={template.templateId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{template.templateId}</td>
                    <td className="px-4 py-3 text-gray-600">{template.description || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/product/create?templateId=${template.templateId}`)}>Use</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(template.templateId)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
          <span>{totalItems} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</Button>
            <span className="px-3 py-1">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
