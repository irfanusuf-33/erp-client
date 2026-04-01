"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Form from "@/components/ui/form/Form";
import { showSuccess, showError } from "@/lib/toast";

export default function EditCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const { getCategory, updateCategory, searchCategories } = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ categoryId: "", categoryName: "", description: "", enabled: false });
  const [originalData, setOriginalData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Array<{ id: string; name: string }>>([{ id: "", name: "" }]);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);

  useEffect(() => {
    if (!categoryId) return;
    (async () => {
      const res = await getCategory(categoryId);
      if (res.success) {
        const cat = res.data.category;
        const children = res.data.children || [];
        const data = { categoryId: cat.categoryId || "", categoryName: cat.categoryName || "", description: cat.description || "", enabled: cat.enabled || false };
        setFormData(data); setOriginalData(data);
        if (children.length > 0) setSelectedCategories(children.map((c: any) => ({ id: c.categoryId, name: c.categoryName })));
      }
      setLoading(false);
    })();
  }, [categoryId]);

  const handleSearchChange = async (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    const newSel = [...selectedCategories]; newSel[index] = { id: "", name: "" }; setSelectedCategories(newSel);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    const newLoad = [...searchLoading]; newLoad[index] = true; setSearchLoading(newLoad);
    try {
      const res = await searchCategories(value);
      const r = [...searchResults]; r[index] = res.success ? res.data || [] : []; setSearchResults(r);
    } finally { const l = [...searchLoading]; l[index] = false; setSearchLoading(l); }
  };

  const handleSelectCategory = (index: number, cat: any) => {
    const newSel = [...selectedCategories]; newSel[index] = { id: cat.categoryId, name: cat.categoryName }; setSelectedCategories(newSel);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const r = [...searchResults]; r[index] = []; setSearchResults(r);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!formData.categoryName) errs.categoryName = "Category Name is required";
    if (!formData.description) errs.description = "Description is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const childCategories = selectedCategories.filter((c) => c.id).map((c) => c.id);
      const changed: any = {};
      const current = { ...formData, childCategories };
      Object.keys(current).forEach((k) => {
        if (JSON.stringify((current as any)[k]) !== JSON.stringify((originalData as any)?.[k])) changed[k] = (current as any)[k];
      });
      if (childCategories.length) changed.childCategories = childCategories;
      const res = await updateCategory(categoryId!, changed);
      if (res.success) {
        showSuccess("Category Updated", "Category updated successfully.");
        router.push("/inventory/category/list");
      }
    } catch (error: any) {
      showError("Error", error?.message || "Failed to update category");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 pl-2 mb-5">Edit Category</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl px-9 pt-10 pb-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 pb-6">Category Details</h2>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Category ID</label>
            <input className="border border-gray-300 dark:border-zinc-800 rounded-lg h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 outline-none focus:border-gray-800 dark:focus:border-gray-300" type="text" placeholder="Enter Category Id" value={formData.categoryId} onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Category Name</label>
            <input className={`border rounded-lg h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 outline-none focus:border-gray-800 ${errors.categoryName ? "border-red-500" : "border-gray-300 dark:border-zinc-800"}`} type="text" placeholder="Enter Category name" value={formData.categoryName} onChange={(e) => { setFormData((p) => ({ ...p, categoryName: e.target.value })); if (errors.categoryName) setErrors((p) => ({ ...p, categoryName: "" })); }} />
            {errors.categoryName && <p className="text-xs text-red-500">{errors.categoryName}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Category Description</label>
          <textarea rows={6} className={`border rounded-lg w-full text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 outline-none focus:border-gray-800 px-6 pt-4 resize-none ${errors.description ? "border-red-500" : "border-gray-300 dark:border-zinc-800"}`} placeholder="Description of the Category" value={formData.description} onChange={(e) => { setFormData((p) => ({ ...p, description: e.target.value })); if (errors.description) setErrors((p) => ({ ...p, description: "" })); }} />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mt-10 mb-2">Assign Child Category (Optional)</h2>
        <div className="flex flex-wrap gap-5">
          {selectedCategories.map((sel, i) => (
            <div key={i} className="flex flex-col gap-3 w-[48%]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Child Category {i + 1}</label>
                {selectedCategories.length > 1 && <button className="text-red-500 hover:text-red-700" onClick={() => setSelectedCategories(selectedCategories.filter((_, j) => j !== i))}><X size={16} /></button>}
              </div>
              <div className="relative">
                <Input placeholder="Search category..." value={sel.name || searchTerms[i] || ""} onChange={(e) => handleSearchChange(i, e.target.value)} />
                {searchLoading[i] && <span className="absolute right-3 top-2.5 text-xs text-gray-400">...</span>}
                {searchResults[i]?.length > 0 && (
                  <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                    {searchResults[i].map((cat: any, j: number) => (
                      <div key={j} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => handleSelectCategory(i, cat)}>
                        <div className="font-medium">{cat.categoryName}</div><div className="text-xs text-gray-500">{cat.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3" onClick={() => setSelectedCategories([...selectedCategories, { id: "", name: "" }])}>
          <Plus size={16} />Add category
        </button>

        <div className="mt-10 mb-14">
          <label className="flex items-center gap-4 cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Enable Category</h3>
            <input type="checkbox" className="appearance-none w-7 h-3.5 rounded-full bg-gray-300 relative cursor-pointer transition-colors checked:bg-amber-400 after:content-[''] after:absolute after:top-1/2 after:left-0.5 after:w-2.5 after:h-2.5 after:rounded-full after:bg-white after:-translate-y-1/2 after:transition-all checked:after:translate-x-3.5" checked={formData.enabled} onChange={(e) => setFormData((p) => ({ ...p, enabled: e.target.checked }))} />
          </label>
        </div>

        <div className="flex justify-end gap-6 w-60 ml-auto">
          <Button variant="outline" onClick={() => router.push("/inventory/category/list")}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Update"}</Button>
        </div>
      </div>
    </div>
  );
}
