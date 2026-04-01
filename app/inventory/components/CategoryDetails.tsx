"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Save, X, Plus, MoreVertical } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/toast";

export default function CategoryDetails() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const { getCategory, updateCategory, searchCategories, toggleCategoryStatus, removeChildCategory } = useGlobalStore();

  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"parent" | "child">("parent");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[][]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const load = async () => {
    if (!categoryId) return;
    setLoading(true);
    const res = await getCategory(categoryId);
    if (res.success) {
      setCategory(res.data);
      setEdited(res.data);
      const children = res.data.children || [];
      setSelectedChildren(children.map((c: any) => ({ id: c.categoryId, name: c.categoryName })));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [categoryId]);

  const handleChange = (field: string, value: any) =>
    setEdited((p: any) => ({ ...p, category: { ...p.category, [field]: value } }));

  const handleSearchChange = async (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    const newSel = [...selectedChildren]; newSel[index] = { id: "", name: "" }; setSelectedChildren(newSel);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    const newLoad = [...searchLoading]; newLoad[index] = true; setSearchLoading(newLoad);
    try {
      const res = await searchCategories(value);
      const r = [...searchResults]; r[index] = res.success ? res.data || [] : []; setSearchResults(r);
    } finally { const l = [...searchLoading]; l[index] = false; setSearchLoading(l); }
  };

  const handleSelectChild = (index: number, cat: any) => {
    const newSel = [...selectedChildren]; newSel[index] = { id: cat.categoryId, name: cat.categoryName }; setSelectedChildren(newSel);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const r = [...searchResults]; r[index] = []; setSearchResults(r);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateCategory(categoryId!, {
        categoryName: edited.category.categoryName,
        description: edited.category.description,
        enabled: edited.category.enabled,
        childCategories: selectedChildren.filter((c) => c.id).map((c) => c.id),
      });
      if (res.success) {
        showSuccess("Category Updated", "Category updated successfully.");
        await load(); setIsEditing(false);
      }
    } catch {
      showError("Update Failed", "Failed to update category");
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async () => {
    if (!selectedRows.length) return;
    await toggleCategoryStatus(selectedRows[0]);
    await load(); setSelectedRows([]);
  };

  const handleRemove = async () => {
    for (const cid of selectedRows) {
      if (activeTab === "parent") await removeChildCategory(cid, category.category.categoryId);
      else await removeChildCategory(category.category.categoryId, cid);
    }
    setSelectedRows([]); await load();
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;
  if (!category) return <div className="p-12 text-center text-gray-500">Category not found</div>;

  const displayData = activeTab === "parent" ? (category.parents || []) : (category.children || []);

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Category Details</h1>

      {/* Details card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl px-9 pt-9 pb-5 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mt-7">Category Details</h2>
          {!isEditing ? (
            <button className="text-blue-600 hover:text-blue-700 mr-8" onClick={() => setIsEditing(true)}><Edit2 size={18} /></button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEdited(category); }}><X size={14} className="mr-1" />Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}><Save size={14} className="mr-1" />{saving ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </div>

        <div className="flex gap-[560px] mt-6 flex-wrap">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Category ID</p>
            <p className="text-sm text-gray-800 dark:text-zinc-100">{category.category?.categoryId}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Category Name</p>
            {isEditing ? <InputField value={edited?.category?.categoryName || ""} onChange={(e) => handleChange("categoryName", e.target.value)} /> : <p className="text-sm text-gray-800 dark:text-zinc-100">{category.category?.categoryName}</p>}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Category Description</p>
          {isEditing ? <TextArea rows={4} value={edited?.category?.description || ""} onChange={(e) => handleChange("description", e.target.value)} /> : <p className="text-sm text-gray-800 dark:text-zinc-100">{category.category?.description || "N/A"}</p>}
        </div>

        {/* Edit child categories */}
        {isEditing && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-100 mb-4">Child Categories</h3>
            {selectedChildren.map((child, i) => (
              <div key={i} className="mb-4 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Child Category {i + 1}</label>
                  {selectedChildren.length > 1 && <button className="text-red-500 hover:text-red-700" onClick={() => setSelectedChildren(selectedChildren.filter((_, j) => j !== i))}><X size={14} /></button>}
                </div>
                <div className="relative">
                  <Input placeholder="Search category..." value={child.name || searchTerms[i] || ""} onChange={(e) => handleSearchChange(i, e.target.value)} />
                  {searchLoading[i] && <span className="absolute right-3 top-2.5 text-xs text-gray-400">...</span>}
                  {searchResults[i]?.length > 0 && (
                    <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                      {searchResults[i].map((cat: any, j: number) => (
                        <div key={j} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => handleSelectChild(i, cat)}>
                          <div className="font-medium">{cat.categoryName}</div><div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2" onClick={() => setSelectedChildren([...selectedChildren, { id: "", name: "" }])}>
              <Plus size={16} />Add Child Category
            </button>
          </div>
        )}

        <div className="mt-9 border-t border-gray-200 dark:border-zinc-800 pt-4">
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Status: {category.category?.enabled ? "Enabled" : "Disabled"}</p>
        </div>
      </div>

      {/* Related categories table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-9 py-10">
          <div className="flex items-center gap-5">
            <button className={`relative pb-1.5 text-sm font-semibold transition-colors ${activeTab === "parent" ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded" : "text-gray-500 opacity-80"}`} onClick={() => setActiveTab("parent")}>Parent Category</button>
            <div className="w-px h-5 bg-gray-300 dark:bg-zinc-800" />
            <button className={`relative pb-1.5 text-sm font-semibold transition-colors ${activeTab === "child" ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded" : "text-gray-500 opacity-80"}`} onClick={() => setActiveTab("child")}>Child Category</button>
          </div>
          <div className="relative">
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" onClick={() => setShowDropdown(!showDropdown)}><MoreVertical size={20} /></button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-10 min-w-[180px] py-1" onClick={() => setShowDropdown(false)}>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-100" onClick={() => router.push("/inventory/category/create")}>Create Categories</button>
                {selectedRows.length > 0 && <>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-100" onClick={handleToggleStatus}>Toggle Status</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-red-500" onClick={handleRemove}>Remove Categories</button>
                </>}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 px-9 mb-10">{activeTab === "parent" ? "Parent" : "Child"} Category List</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800">
                {[["ID", true], ["Category", false], ["Creation", false], ["Status", false]].map(([h, hasCheck]) => (
                  <th key={h as string} className="px-15 py-5 text-left text-sm font-semibold text-gray-800 dark:text-zinc-100">
                    {hasCheck ? (
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={displayData.length > 0 && selectedRows.length === displayData.length} onChange={(e) => setSelectedRows(e.target.checked ? displayData.map((c: any) => c.categoryId) : [])} />
                        <span className="border-l border-gray-800 dark:border-zinc-800 pl-2">{h as string}</span>
                      </div>
                    ) : <span className="border-l border-gray-800 dark:border-zinc-800 pl-2">{h as string}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No {activeTab} categories found</td></tr>
              ) : displayData.map((cat: any) => (
                <tr key={cat.categoryId} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-15 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={selectedRows.includes(cat.categoryId)} onChange={(e) => setSelectedRows(e.target.checked ? [...selectedRows, cat.categoryId] : selectedRows.filter((id) => id !== cat.categoryId))} />
                      <span className="ml-3">{cat.categoryId}</span>
                    </div>
                  </td>
                  <td className="px-15 py-4 text-sm text-gray-700 dark:text-zinc-300">{cat.categoryName}</td>
                  <td className="px-15 py-4 text-sm text-gray-700 dark:text-zinc-300">{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td className="px-15 py-4">
                    <span className={`inline-flex items-center justify-center w-24 h-8 rounded-lg text-sm font-medium ${cat.enabled ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-gray-100 dark:bg-zinc-800 text-gray-400"}`}>{cat.enabled ? "Enabled" : "Disabled"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
