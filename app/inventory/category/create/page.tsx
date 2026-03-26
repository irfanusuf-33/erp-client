"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateCategory() {
  const router = useRouter();
  const { addCategory, searchCategories } = useGlobalStore();
  const [formData, setFormData] = useState({ categoryId: "", categoryName: "", description: "", childCategories: [] as string[], enabled: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);
  const [selectedCategories, setSelectedCategories] = useState<Array<{ id: string; name: string }>>([{ id: "", name: "" }]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.categoryId) newErrors.categoryId = "Category ID is required";
    if (!formData.categoryName) newErrors.categoryName = "Category Name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    const payload = { ...formData, childCategories: selectedCategories.filter((c) => c.id).map((c) => c.id) };
    const response = await addCategory(payload);
    if (response.success) router.push("/inventory/category/list");
    setIsSubmitting(false);
  };

  const handleSearchChange = (index: number, value: string) => {
    const newTerms = [...searchTerms];
    newTerms[index] = value;
    setSearchTerms(newTerms);
    const newSelected = [...selectedCategories];
    newSelected[index] = { id: "", name: "" };
    setSelectedCategories(newSelected);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    const t = setTimeout(async () => {
      const newLoading = [...searchLoading]; newLoading[index] = true; setSearchLoading(newLoading);
      const res = await searchCategories(value);
      const newResults = [...searchResults]; newResults[index] = res.success ? res.data : []; setSearchResults(newResults);
      const nl = [...searchLoading]; nl[index] = false; setSearchLoading(nl);
    }, 500);
    return () => clearTimeout(t);
  };

  const handleSelectCategory = (index: number, cat: any) => {
    const newSelected = [...selectedCategories]; newSelected[index] = { id: cat.categoryId, name: cat.categoryName }; setSelectedCategories(newSelected);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const newResults = [...searchResults]; newResults[index] = []; setSearchResults(newResults);
  };

  const addCategoryField = () => {
    setSelectedCategories((prev) => [...prev, { id: "", name: "" }]);
    setSearchTerms((prev) => [...prev, ""]);
    setSearchResults((prev) => [...prev, []]);
    setSearchLoading((prev) => [...prev, false]);
  };

  const removeCategoryField = () => {
    if (selectedCategories.length > 1) {
      setSelectedCategories((prev) => prev.slice(0, -1));
      setSearchTerms((prev) => prev.slice(0, -1));
      setSearchResults((prev) => prev.slice(0, -1));
      setSearchLoading((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="create-product-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Category</h1>

      {/* Category Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Category Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category ID <span className="text-red-500">*</span></label>
            <Input value={formData.categoryId} onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))} placeholder="Enter Category Id" />
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category Name <span className="text-red-500">*</span></label>
            <Input value={formData.categoryName} onChange={(e) => setFormData((prev) => ({ ...prev, categoryName: e.target.value }))} placeholder="Enter Category name" />
            {errors.categoryName && <p className="mt-1 text-xs text-red-500">{errors.categoryName}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Category Description <span className="text-red-500">*</span></label>
            <textarea className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={6} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description of the Category" />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Assign Child Category */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Assign Child Category (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedCategories.map((_, i) => (
            <div key={i} className="form-group">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Child Category {i + 1}</label>
                {selectedCategories.length > 1 && (
                  <button type="button" onClick={removeCategoryField} className="text-gray-400 hover:text-red-500">×</button>
                )}
              </div>
              <div className="relative">
                <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search and select category..." value={selectedCategories[i]?.name || searchTerms[i] || ""} onChange={(e) => handleSearchChange(i, e.target.value)} />
                {searchLoading[i] && <span className="absolute right-3 top-2 text-xs text-gray-400">...</span>}
                {searchResults[i]?.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchResults[i].map((cat: any, catIdx: number) => (
                      <div key={catIdx} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => handleSelectCategory(i, cat)}>
                        <div className="font-medium">{cat.categoryName}</div>
                        <div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" type="button" onClick={addCategoryField}>+ Add category</Button>
      </div>

      {/* Category Settings */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Category Settings</h2>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-medium">Enable Category</span>
          <input className="w-4 h-4" type="checkbox" checked={formData.enabled} onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))} />
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => router.push("/inventory/category/list")}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </div>
    </div>
  );
}
