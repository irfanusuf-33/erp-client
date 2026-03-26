"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryCategoryDetails() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const { getCategory, updateCategory, searchCategories, removeChildCategory, toggleCategoryStatus } = useGlobalStore();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("parent");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[][]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([]);
  const [selectedChildCategories, setSelectedChildCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    getCategory(categoryId).then((result) => {
      if (result.success) {
        // result.data = { category, children, parents }
        setCategory(result.data);
        setEditedCategory(result.data);
        const children = result.data.children || [];
        setSelectedChildCategories(children.map((c: any) => ({ id: c.categoryId, name: c.categoryName })));
      }
      setLoading(false);
    });
  }, [categoryId]);

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!category) return <div className="p-12 text-center">Category not found</div>;

  const displayData = active === "parent" ? (category.parents || []) : (category.children || []);

  const handleToggleStatus = async () => {
    if (!categoryId || selectedCategories.length === 0) return;
    const result = await toggleCategoryStatus(selectedCategories as any);
    if (result.success) {
      const refreshResult = await getCategory(categoryId);
      if (refreshResult.success) setCategory(refreshResult.data);
    }
  };

  const handleRemoveCategories = async () => {
    if (!categoryId || selectedCategories.length === 0) return;
    for (const catIdToRemove of selectedCategories) {
      if (active === "parent") await removeChildCategory(catIdToRemove, category.category.categoryId);
      else await removeChildCategory(category.category.categoryId, catIdToRemove);
    }
    setSelectedCategories([]);
    const refreshResult = await getCategory(categoryId);
    if (refreshResult.success) setCategory(refreshResult.data);
  };

  const handleSearchChange = (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    const newSelected = [...selectedChildCategories]; newSelected[index] = { id: "", name: "" }; setSelectedChildCategories(newSelected);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    setTimeout(async () => {
      const nl = [...searchLoading]; nl[index] = true; setSearchLoading(nl);
      const res = await searchCategories(value);
      const nr = [...searchResults]; nr[index] = res.success ? res.data : []; setSearchResults(nr);
      const nl2 = [...searchLoading]; nl2[index] = false; setSearchLoading(nl2);
    }, 500);
  };

  const handleSelectChildCategory = (index: number, cat: any) => {
    const newSelected = [...selectedChildCategories]; newSelected[index] = { id: cat.categoryId, name: cat.categoryName }; setSelectedChildCategories(newSelected);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const newResults = [...searchResults]; newResults[index] = []; setSearchResults(newResults);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const childCategories = selectedChildCategories.filter((c) => c.id).map((c) => c.id);
    const updateData = { categoryName: editedCategory.category.categoryName, description: editedCategory.category.description, enabled: editedCategory.category.enabled, childCategories };
    const result = await updateCategory(categoryId!, updateData);
    if (result.success) {
      const refreshResult = await getCategory(categoryId!);
      if (refreshResult.success) { setCategory(refreshResult.data); setEditedCategory(refreshResult.data); }
      setIsEditing(false);
    }
    setIsSubmitting(false);
  };

  const getStatus = () => {
    if (selectedCategories.length === 1) {
      const selected = displayData.find((d: any) => d.categoryId === selectedCategories[0]);
      return selected?.enabled ? "Disable" : "Enable";
    }
    return "Change Status";
  };

  return (
    <div className="inventory-category-details-main-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Category Details</h1>

      <div className="category-details-container bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Category Details</h1>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditedCategory({ ...category }); const children = category.children || []; setSelectedChildCategories(children.map((c: any) => ({ id: c.categoryId, name: c.categoryName }))); }}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditedCategory(category); }}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </div>

        {/* ID & Name */}
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500 mb-1">Category ID</p><p className="font-medium">{category.category?.categoryId}</p></div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Category Name</p>
            {isEditing ? <Input value={editedCategory?.category?.categoryName || ""} onChange={(e) => setEditedCategory((prev: any) => ({ ...prev, category: { ...prev.category, categoryName: e.target.value } }))} /> : <p className="font-medium">{category.category?.categoryName}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Category Description</p>
          {isEditing ? <textarea rows={4} className="w-full border border-input rounded-md px-2.5 py-1 text-sm" value={editedCategory?.category?.description || ""} onChange={(e) => setEditedCategory((prev: any) => ({ ...prev, category: { ...prev.category, description: e.target.value } }))} /> : <p>{category.category?.description || "N/A"}</p>}
        </div>

        {/* Child Categories (edit mode) */}
        {isEditing && (
          <div>
            <h3 className="text-base font-semibold mb-3">Child Categories</h3>
            {selectedChildCategories.map((child, index) => (
              <div key={index} className="mb-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Child Category {index + 1}</label>
                  {selectedChildCategories.length > 1 && (
                    <button type="button" onClick={() => setSelectedChildCategories(selectedChildCategories.filter((_, i) => i !== index))} className="text-red-500 text-sm">Remove</button>
                  )}
                </div>
                <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search category..." value={child.name || searchTerms[index] || ""} onChange={(e) => handleSearchChange(index, e.target.value)} />
                {searchResults[index]?.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchResults[index].map((cat: any, catIdx: number) => (
                      <div key={catIdx} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => handleSelectChildCategory(index, cat)}>
                        <div className="font-medium">{cat.categoryName}</div>
                        <div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" type="button" onClick={() => setSelectedChildCategories([...selectedChildCategories, { id: "", name: "" }])}>+ Add Child Category</Button>
          </div>
        )}

        <div className="text-sm font-medium">Status: {category.category?.enabled ? "Enabled" : "Disabled"}</div>
      </div>

      {/* Parent/Child Category List */}
      <div className="category-list-container bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <button className={`text-sm font-semibold pb-1 border-b-2 ${active === "parent" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`} onClick={() => setActive("parent")}>Parent Category</button>
            <button className={`text-sm font-semibold pb-1 border-b-2 ${active === "child" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`} onClick={() => setActive("child")}>Child Category</button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/inventory/category/create")}>Create Categories</Button>
            {selectedCategories.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleToggleStatus}>{getStatus()}</Button>
                <Button variant="outline" size="sm" onClick={handleRemoveCategories}>Remove Categories</Button>
              </>
            )}
          </div>
        </div>

        <h1 className="text-base font-semibold mb-3">{active === "parent" ? "Parent" : "Child"} Category List</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={displayData.length > 0 && selectedCategories.length === displayData.length} onChange={(e) => setSelectedCategories(e.target.checked ? displayData.map((cat: any) => cat.categoryId) : [])} />
                  <span className="ml-2 font-medium text-gray-600">ID</span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{active === "parent" ? "Parent" : "Child"} Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Creation</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No {active} categories found</td></tr>
              ) : (
                displayData.map((cat: any) => (
                  <tr key={cat.categoryId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedCategories.includes(cat.categoryId)} onChange={(e) => setSelectedCategories(e.target.checked ? [...selectedCategories, cat.categoryId] : selectedCategories.filter((id) => id !== cat.categoryId))} />
                      <span className="ml-2">{cat.categoryId}</span>
                    </td>
                    <td className="px-4 py-3">{cat.categoryName}</td>
                    <td className="px-4 py-3">{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {cat.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
