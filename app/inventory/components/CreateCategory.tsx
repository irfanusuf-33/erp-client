"use client";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Form from "@/components/ui/form/Form";
import { showSuccess, showError } from "@/lib/toast";

export default function CreateCategory() {
  const router = useRouter();
  const { addCategory, searchCategories } = useGlobalStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    categoryName: "",
    description: "",
    childCategories: [] as string[],
    enabled: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);
  const [debounceTimeouts, setDebounceTimeouts] = useState<(NodeJS.Timeout | null)[]>([null]);
  const [selectedCategories, setSelectedCategories] = useState<Array<{ id: string; name: string }>>([
    { id: "", name: "" },
  ]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSearchChange = async (index: number, value: string) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);

    const newSelected = [...selectedCategories];
    newSelected[index] = { id: "", name: "" };
    setSelectedCategories(newSelected);

    if (debounceTimeouts[index]) {
      clearTimeout(debounceTimeouts[index]!);
    }

    if (value.trim() === "") {
      const newResults = [...searchResults];
      newResults[index] = [];
      setSearchResults(newResults);
      return;
    }

    const timeout = setTimeout(async () => {
      const newLoading = [...searchLoading];
      newLoading[index] = true;
      setSearchLoading(newLoading);

      try {
        const res = await searchCategories(value);
        if (res.success) {
          const newResults = [...searchResults];
          newResults[index] = res.data || [];
          setSearchResults(newResults);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        const newLoading = [...searchLoading];
        newLoading[index] = false;
        setSearchLoading(newLoading);
      }
    }, 500);

    const newTimeouts = [...debounceTimeouts];
    newTimeouts[index] = timeout;
    setDebounceTimeouts(newTimeouts);
  };

  const handleSelectCategory = (index: number, cat: any) => {
    const newSelected = [...selectedCategories];
    newSelected[index] = { id: cat.categoryId, name: cat.categoryName };
    setSelectedCategories(newSelected);

    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = "";
    setSearchTerms(newSearchTerms);

    const newResults = [...searchResults];
    newResults[index] = [];
    setSearchResults(newResults);
  };

  const addCategoryField = () => {
    setSelectedCategories((prev) => [...prev, { id: "", name: "" }]);
    setSearchTerms((prev) => [...prev, ""]);
    setSearchResults((prev) => [...prev, []]);
    setSearchLoading((prev) => [...prev, false]);
    setDebounceTimeouts((prev) => [...prev, null]);
  };

  const removeCategoryField = (index: number) => {
    if (selectedCategories.length > 1) {
      setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
      setSearchTerms((prev) => prev.filter((_, i) => i !== index));
      setSearchResults((prev) => prev.filter((_, i) => i !== index));
      setSearchLoading((prev) => prev.filter((_, i) => i !== index));
      setDebounceTimeouts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setValidationErrors({});

    const errors: Record<string, string> = {};
    if (!formData.categoryId) errors.categoryId = "Category ID is required";
    if (!formData.categoryName) errors.categoryName = "Category Name is required";
    if (!formData.description) errors.description = "Description is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        childCategories: selectedCategories.filter((c) => c.id).map((c) => c.id),
      };
      const response = await addCategory(payload);
      if (response.success) {
        showSuccess("Category Created", "The category has been created successfully.");
        router.push("/inventory/category/list");
      } else {
        showError("Failed to Create Category", response.msg || "An error occurred.");
        setValidationErrors({ submit: response.msg || "Failed to create category" });
      }
    } catch (error: any) {
      setValidationErrors({ submit: error?.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Create Category</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Category Details" desc="*Required field">
          <InputField
            label="Category ID"
            value={formData.categoryId}
            onChange={(e) => handleInputChange("categoryId", e.target.value)}
            placeholder="Enter Category Id"
            required
            error={validationErrors.categoryId}
          />
          <InputField
            label="Category Name"
            value={formData.categoryName}
            onChange={(e) => handleInputChange("categoryName", e.target.value)}
            placeholder="Enter Category name"
            required
            error={validationErrors.categoryName}
          />
          <div className="col-span-2">
            <TextArea
              label="Category Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description of the Category"
              rows={6}
              required
              error={validationErrors.description}
            />
          </div>
        </Form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Assign Child Category (Optional)" cols={2}>
          {selectedCategories.map((selected, i) => (
            <div key={i} className="form-group">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Child Category {i + 1}
                </label>
                {selectedCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategoryField(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  placeholder="Search and select category..."
                  value={selected.name || searchTerms[i] || ""}
                  onChange={(e) => handleSearchChange(i, e.target.value)}
                />
                {searchLoading[i] && (
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>
                )}
                {searchResults[i]?.length > 0 && (
                  <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                    {searchResults[i].map((cat: any, catIdx: number) => (
                      <div
                        key={catIdx}
                        className="p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                        onClick={() => handleSelectCategory(i, cat)}
                      >
                        <div className="font-medium text-sm">{cat.categoryName}</div>
                        <div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="col-span-2">
            <button
              type="button"
              onClick={addCategoryField}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add category</span>
            </button>
          </div>
        </Form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Category Settings">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleInputChange("enabled", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Enable Category</span>
            </label>
          </div>
        </Form>
      </div>

      {validationErrors.submit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.submit}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/inventory/category/list")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

