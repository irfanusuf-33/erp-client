"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryEditCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const { getCategory, updateCategory, searchCategories } = useGlobalStore();
  const [formData, setFormData] = useState({ categoryId: "", categoryName: "", description: "", childCategories: [] as string[], enabled: false });
  const [originalData, setOriginalData] = useState({ categoryId: "", categoryName: "", description: "", childCategories: [] as string[], enabled: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);
  const [selectedCategories, setSelectedCategories] = useState<Array<{ id: string; name: string }>>([{ id: "", name: "" }]);

  useEffect(() => {
    if (!categoryId) return;
    getCategory(categoryId).then((result) => {
      if (result.success) {
        const categoryData = result.data.category;
        const children = result.data.children || [];
        const initialData = { categoryId: categoryData.categoryId || "", categoryName: categoryData.categoryName || "", description: categoryData.description || "", childCategories: children.map((c: any) => c.categoryId), enabled: categoryData.enabled || false };
        setFormData(initialData);
        setOriginalData(initialData);
        if (children.length > 0) setSelectedCategories(children.map((c: any) => ({ id: c.categoryId, name: c.categoryName })));
      }
      setLoading(false);
    });
  }, [categoryId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    const currentChildCategories = selectedCategories.filter((c) => c.id).map((c) => c.id);
    const currentFormData = { ...formData, childCategories: currentChildCategories };
    const changedFields: any = {};
    Object.keys(currentFormData).forEach((key) => {
      if (JSON.stringify(currentFormData[key as keyof typeof currentFormData]) !== JSON.stringify(originalData[key as keyof typeof originalData])) {
        changedFields[key] = currentFormData[key as keyof typeof currentFormData];
      }
    });
    if (Object.keys(changedFields).length === 0) { setIsSubmitting(false); return; }
    const response = await updateCategory(categoryId!, changedFields);
    if (response.success) router.push("/inventory/category/list");
    setIsSubmitting(false);
  };

  const handleSearchChange = (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    const newSelected = [...selectedCategories]; newSelected[index] = { id: "", name: "" }; setSelectedCategories(newSelected);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    setTimeout(async () => {
      const nl = [...searchLoading]; nl[index] = true; setSearchLoading(nl);
      const res = await searchCategories(value);
      const nr = [...searchResults]; nr[index] = res.success ? res.data : []; setSearchResults(nr);
      const nl2 = [...searchLoading]; nl2[index] = false; setSearchLoading(nl2);
    }, 500);
  };

  const handleSelectCategory = (index: number, cat: any) => {
    const newSelected = [...selectedCategories]; newSelected[index] = { id: cat.categoryId, name: cat.categoryName }; setSelectedCategories(newSelected);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const newResults = [...searchResults]; newResults[index] = []; setSearchResults(newResults);
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="edit-category-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Category</h1>

      <div className="category-details-container bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Category Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category ID</label>
            <Input type="text" placeholder="Enter Category Id....." value={formData.categoryId} onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category Name</label>
            <Input type="text" placeholder="Enter Category name....." value={formData.categoryName} onChange={(e) => setFormData((prev) => ({ ...prev, categoryName: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Category Description</label>
          <textarea rows={6} className="w-full border border-input rounded-md px-2.5 py-1 text-sm" placeholder="Description of the Category" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
        </div>

        <h2 className="text-base font-semibold">Assign Child Category (Optional)</h2>

        <div className="space-y-3">
          {selectedCategories.map((_, i) => (
            <div key={i} className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Child Category {i + 1}</label>
                {selectedCategories.length > 1 && (
                  <button type="button" onClick={() => setSelectedCategories((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 text-sm">Remove</button>
                )}
              </div>
              <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search category....." value={selectedCategories[i]?.name || searchTerms[i] || ""} onChange={(e) => handleSearchChange(i, e.target.value)} />
              {searchLoading[i] && <span className="absolute right-3 top-8 text-xs text-gray-400">...</span>}
              {searchResults[i]?.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults[i].map((cat: any, catIdx: number) => (
                    <div key={catIdx} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => handleSelectCategory(i, cat)}>
                      <div className="font-medium">{cat.categoryName}</div>
                      <div className="text-xs text-gray-500">{cat.categoryId}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" type="button" onClick={() => setSelectedCategories((prev) => [...prev, { id: "", name: "" }])}>+ Add category</Button>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-medium">Enable Category</span>
          <input className="w-4 h-4" type="checkbox" checked={formData.enabled} onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))} />
        </label>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => router.push("/inventory/category/list")}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update"}</Button>
        </div>
      </div>
    </div>
  );
}
