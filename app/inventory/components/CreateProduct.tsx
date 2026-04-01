"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Select from "@/components/ui/form/Select";
import Form from "@/components/ui/form/Form";
import { showSuccess, showError } from "@/lib/toast";

export default function CreateProduct() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId");
  
  const {
    addProduct,
    generateProductId,
    getTemplate,
    searchCategories,
    searchWarehouses,
    saveProductTemplate,
  } = useGlobalStore();

  const [loading, setLoading] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [createTemplate, setCreateTemplate] = useState(false);
  
  const [formData, setFormData] = useState<Record<string, any>>({
    templateId: templateId || "baseTemplate",
    productId: "",
    displayName: "",
    manufacturerId: "",
    brand: "",
    lowStockThreshold: "",
    uom: "",
    value: "",
    shortDesc: "",
    longDesc: "",
    category: [],
    enableProduct: false,
    perpetual: false,
    allocation: "",
    instockDate: "",
    backorderQty: "",
    preorderQty: "",
    productImages: [],
  });

  const [pricingEntries, setPricingEntries] = useState([
    { currency: "EUR", cutOffPrice: "", costPrice: "", price: "" },
  ]);

  const [warehouseEntries, setWarehouseEntries] = useState([
    { warehouseId: "", ats: "" },
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pricingErrors, setPricingErrors] = useState<Record<number, Record<string, string>>>({});
  const [warehouseErrors, setWarehouseErrors] = useState<Record<number, Record<string, string>>>({});
  
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [warehouseSearches, setWarehouseSearches] = useState<Record<number, string>>({});
  const [filteredWarehouses, setFilteredWarehouses] = useState<Record<number, any[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [id]: finalValue }));
    if (validationErrors[id]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleGenerateProductId = async () => {
    setIsGeneratingId(true);
    try {
      const result = await generateProductId();
      const generatedId = result?.data?.productId;
      if (result?.success && generatedId) {
        setFormData((prev) => ({ ...prev, productId: generatedId }));
        if (validationErrors.productId) {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.productId;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error("Error generating product ID:", error);
    } finally {
      setIsGeneratingId(false);
    }
  };

  const searchCategoriesAPI = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim()) {
      const result = await searchCategories(searchTerm);
      if (result.success) {
        setFilteredCategories(result.data);
      } else {
        setFilteredCategories([]);
      }
    } else {
      setFilteredCategories([]);
    }
  }, [searchCategories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCategoriesAPI(categorySearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [categorySearch, searchCategoriesAPI]);

  const handleCategoryAdd = (categoryId: string) => {
    const selectedCategories = formData.category || [];
    if (!selectedCategories.includes(categoryId)) {
      setFormData((prev) => ({
        ...prev,
        category: [...selectedCategories, categoryId],
      }));
    }
    setCategorySearch("");
    setFilteredCategories([]);
  };

  const handleCategoryRemove = (categoryId: string) => {
    const selectedCategories = formData.category || [];
    setFormData((prev) => ({
      ...prev,
      category: selectedCategories.filter((id: string) => id !== categoryId),
    }));
  };

  const handlePricingChange = (index: number, field: string, value: string) => {
    setPricingEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const handleAddCurrency = () => {
    const lastEntry = pricingEntries[pricingEntries.length - 1];
    setPricingEntries((prev) => [...prev, { ...lastEntry, cutOffPrice: "", costPrice: "", price: "" }]);
  };

  const handleRemovePricingEntry = (index: number) => {
    if (pricingEntries.length > 1) {
      setPricingEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleWarehouseChange = (index: number, field: string, value: string) => {
    setWarehouseEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const handleAddWarehouse = () => {
    setWarehouseEntries((prev) => [...prev, { warehouseId: "", ats: "" }]);
  };

  const handleRemoveWarehouseEntry = (index: number) => {
    if (warehouseEntries.length > 1) {
      setWarehouseEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const searchWarehousesAPI = useCallback(
    async (searchTerm: string, index: number) => {
      if (searchTerm.trim()) {
        const result = await searchWarehouses(searchTerm);
        if (result.success) {
          setFilteredWarehouses((prev) => ({ ...prev, [index]: result.data }));
        } else {
          setFilteredWarehouses((prev) => ({ ...prev, [index]: [] }));
        }
      } else {
        setFilteredWarehouses((prev) => ({ ...prev, [index]: [] }));
      }
    },
    [searchWarehouses]
  );

  const handleWarehouseSearch = (searchTerm: string, index: number) => {
    setWarehouseSearches((prev) => ({ ...prev, [index]: searchTerm }));
    const timeoutId = setTimeout(() => {
      searchWarehousesAPI(searchTerm, index);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleWarehouseSelect = (warehouseId: string, index: number) => {
    handleWarehouseChange(index, "warehouseId", warehouseId);
    setWarehouseSearches((prev) => ({ ...prev, [index]: "" }));
    setFilteredWarehouses((prev) => ({ ...prev, [index]: [] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, productImages: filesArray }));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    const errors: Record<string, string> = {};
    if (!formData.productId) errors.productId = "Product ID is required";
    if (!formData.displayName) errors.displayName = "Display name is required";
    if (!formData.manufacturerId) errors.manufacturerId = "Manufacturer ID is required";
    if (!formData.brand) errors.brand = "Brand is required";
    if (!formData.uom) errors.uom = "Unit of measure is required";
    if (!formData.value) errors.value = "Value is required";
    if (!formData.shortDesc) errors.shortDesc = "Short description is required";
    if (!formData.longDesc) errors.longDesc = "Long description is required";
    if (!formData.allocation) errors.allocation = "Allocation is required";
    if (!formData.instockDate) errors.instockDate = "In-stock date is required";
    if (!formData.lowStockThreshold) errors.lowStockThreshold = "Low stock threshold is required";
    if (!formData.category || formData.category.length === 0) errors.category = "At least one category is required";

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    if (!formData.productImages || formData.productImages.length === 0) {
      setValidationErrors({ productImages: "At least one product image is required" });
      setLoading(false);
      return;
    }

    const productData = {
      productId: formData.productId,
      templateId: templateId || "baseTemplate",
      name: formData.displayName,
      lowStockThreshold: formData.lowStockThreshold,
      enable: formData.enableProduct,
      brand: formData.brand,
      manufacturerProductId: formData.manufacturerId,
      shortDescription: formData.shortDesc,
      longDescription: formData.longDesc,
      unitOfMeasure: formData.uom,
      value: formData.value,
      category: formData.category || [],
      warehouses: warehouseEntries.map((entry) => ({
        warehouseId: entry.warehouseId,
        ats: parseInt(entry.ats) || 0,
      })),
      pricingDetails: pricingEntries.map((entry) => ({
        currency: entry.currency,
        cutOffPrice: parseFloat(entry.cutOffPrice) || 0,
        costPrice: parseFloat(entry.costPrice) || 0,
        price: parseFloat(entry.price) || 0,
      })),
      inventory: {
        allocation: parseInt(formData.allocation) || 0,
        perpetual: formData.perpetual || false,
        backorderQty: parseInt(formData.backorderQty) || 0,
        preOrderQty: parseInt(formData.preorderQty) || 0,
        inStockDate: formData.instockDate
          ? new Date(formData.instockDate).toISOString()
          : new Date().toISOString(),
        inStockFlag: true,
      },
    };

    try {
      const result = await addProduct(productData, formData.productImages || []);
      if (result.success) {
        showSuccess("Product Created", result.msg || "Product created successfully.");
        router.push("/inventory/product/productList");
      } else {
        showError("Failed to Create Product", result.msg || "An unexpected error occurred.");
        setValidationErrors({ submit: result.msg || "Failed to create product" });
      }
    } catch (error: any) {
      setValidationErrors({ submit: error?.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Create Product</h1>

      <form onSubmit={handleSaveProduct}>
        {/* Product Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
          <Form title="Product Details" desc="*Required field" cols={2}>
            <div className="flex gap-3">
              <div className="flex-1">
                <InputField
                  label="Product ID"
                  type="text"
                  id="productId"
                  placeholder="e.g, PROD-2024-00001"
                  value={formData.productId || ""}
                  onChange={handleChange}
                  required
                  error={validationErrors.productId}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleGenerateProductId}
                  disabled={isGeneratingId}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGeneratingId ? "Generating..." : "Generate ID"}
                </Button>
              </div>
            </div>

            <InputField
              label="Display Name"
              type="text"
              id="displayName"
              placeholder="e.g, Product name 00012"
              value={formData.displayName || ""}
              onChange={handleChange}
              required
              error={validationErrors.displayName}
            />

            <InputField
              label="Manufacturer Product ID"
              type="text"
              id="manufacturerId"
              placeholder="e.g, SR-ETIR-012"
              value={formData.manufacturerId || ""}
              onChange={handleChange}
              required
              error={validationErrors.manufacturerId}
            />

            <InputField
              label="Brand"
              type="text"
              id="brand"
              placeholder="e.g, Brand of the product"
              value={formData.brand || ""}
              onChange={handleChange}
              required
              error={validationErrors.brand}
            />

            <Select
              label="Unit of Measure"
              options={[
                { value: "kilograms", label: "Kilograms (kg)" },
                { value: "kilowatt", label: "Kilowatt (kW)" },
                { value: "piece", label: "Piece" },
                { value: "pack", label: "Pack" },
                { value: "pair", label: "Pair" },
                { value: "roll", label: "Roll" },
                { value: "gram", label: "Gram (g)" },
                { value: "liter", label: "Liter (L)" },
                { value: "meter", label: "Meter (m)" },
              ]}
              placeholder="Select unit"
              defaultValue={formData.uom || ""}
              onChange={(value) => handleChange({ target: { id: "uom", value } } as any)}
              required
              error={validationErrors.uom}
            />

            <InputField
              label="Value"
              type="text"
              id="value"
              placeholder="Enter value"
              value={formData.value || ""}
              onChange={handleChange}
              required
              error={validationErrors.value}
            />

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Category<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="border border-gray-300 dark:border-zinc-800 rounded-md p-2 min-h-[42px]">
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.category || []).map((categoryId: string) => (
                    <span
                      key={categoryId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                    >
                      {categoryId}
                      <button
                        type="button"
                        onClick={() => handleCategoryRemove(categoryId)}
                        className="hover:text-blue-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  type="text"
                  placeholder="Search and select categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="border-0 p-0 focus:ring-0"
                />
                {categorySearch && filteredCategories.length > 0 && (
                  <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                    {filteredCategories.map((category) => (
                      <div
                        key={category._id}
                        className="p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                        onClick={() => handleCategoryAdd(category.categoryId)}
                      >
                        <div className="font-medium text-sm">{category.categoryName}</div>
                        <div className="text-xs text-gray-500">ID: {category.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {validationErrors.category && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.category}</p>
              )}
            </div>

            <div className="col-span-2">
              <TextArea
                label="Short Description"
                id="shortDesc"
                placeholder="A brief summary of the product"
                rows={2}
                value={formData.shortDesc || ""}
                onChange={handleChange}
                required
                error={validationErrors.shortDesc}
              />
            </div>

            <div className="col-span-2">
              <TextArea
                label="Long Description"
                id="longDesc"
                placeholder="Detailed product description, features, and benefits"
                rows={4}
                value={formData.longDesc || ""}
                onChange={handleChange}
                required
                error={validationErrors.longDesc}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Product Images<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md"
              />
              {validationErrors.productImages && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.productImages}</p>
              )}
            </div>
          </Form>
        </div>

        {/* Inventory Management */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
          <Form title="Inventory Management" cols={2}>
            <InputField
              label="Allocation"
              type="number"
              id="allocation"
              placeholder="200"
              value={formData.allocation || ""}
              onChange={handleChange}
              required
              error={validationErrors.allocation}
            />

            <InputField
              label="In-Stock Date"
              type="date"
              id="instockDate"
              value={formData.instockDate || ""}
              onChange={handleChange}
              required
              error={validationErrors.instockDate}
            />

            <InputField
              label="Backorder Quantity"
              type="number"
              id="backorderQty"
              placeholder="50"
              value={formData.backorderQty || ""}
              onChange={handleChange}
              error={validationErrors.backorderQty}
            />

            <InputField
              label="Preorder Quantity"
              type="number"
              id="preorderQty"
              placeholder="100"
              value={formData.preorderQty || ""}
              onChange={handleChange}
              hint="Quantity reserved for incoming preorder demand."
              error={validationErrors.preorderQty}
            />

            <InputField
              label="Low Stock Threshold"
              type="text"
              id="lowStockThreshold"
              placeholder="Enter minimum quantity for alert, e.g. 19"
              value={formData.lowStockThreshold || ""}
              onChange={handleChange}
              required
              error={validationErrors.lowStockThreshold}
            />
          </Form>
        </div>

        {/* Warehouse Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
          <Form title="Warehouse Details" cols={2}>
            <div className="col-span-2 flex justify-end mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddWarehouse}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Warehouse
              </Button>
            </div>
            {warehouseEntries.map((entry, index) => (
              <div key={index} className="col-span-2 grid grid-cols-2 gap-4">
                <div className="form-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Warehouse ID<span className="text-red-500 ml-1">*</span>
                    </label>
                    {warehouseEntries.length > 1 && index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWarehouseEntry(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search and select warehouse..."
                      value={warehouseSearches[index] || entry.warehouseId}
                      onChange={(e) => handleWarehouseSearch(e.target.value, index)}
                    />
                    {warehouseSearches[index] && filteredWarehouses[index]?.length > 0 && (
                      <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                        {filteredWarehouses[index].map((warehouse) => (
                          <div
                            key={warehouse._id}
                            className="p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                            onClick={() => handleWarehouseSelect(warehouse.warehouseId, index)}
                          >
                            <div className="font-medium text-sm">{warehouse.name}</div>
                            <div className="text-xs text-gray-500">ID: {warehouse.warehouseId}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <InputField
                  label="ATS (Available to Sell)"
                  type="number"
                  placeholder="0"
                  value={entry.ats}
                  onChange={(e) => handleWarehouseChange(index, "ats", e.target.value)}
                  required
                />
              </div>
            ))}
          </Form>
        </div>

        {/* Pricing Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
          <Form title="Pricing Details" cols={2}>
            <div className="col-span-2 flex justify-end mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCurrency}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Currency
              </Button>
            </div>
            {pricingEntries.map((entry, index) => (
              <div key={index} className="col-span-2 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Currency {index + 1}</h4>
                  {pricingEntries.length > 1 && index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePricingEntry(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Select
                    options={[
                      { value: "EUR", label: "Euro / EUR" },
                      { value: "USD", label: "US Dollar / USD" },
                      { value: "INR", label: "Indian Rupee / INR" },
                      { value: "SAR", label: "Saudi Riyal / SAR" },
                      { value: "CAD", label: "Canadian Dollar / CAD" },
                    ]}
                    placeholder="Select currency"
                    defaultValue={entry.currency}
                    onChange={(value) => handlePricingChange(index, "currency", value)}
                  />
                  <InputField
                    label="Cut off Price"
                    type="text"
                    placeholder="$ 0.00"
                    value={entry.cutOffPrice}
                    onChange={(e) => handlePricingChange(index, "cutOffPrice", e.target.value)}
                  />
                  <InputField
                    label="Cost Price"
                    type="text"
                    placeholder="$ 0.00"
                    value={entry.costPrice}
                    onChange={(e) => handlePricingChange(index, "costPrice", e.target.value)}
                    required
                  />
                  <InputField
                    label="Selling Price"
                    type="text"
                    placeholder="$ 0.00"
                    value={entry.price}
                    onChange={(e) => handlePricingChange(index, "price", e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </Form>
        </div>

        {/* Product Settings */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
          <Form title="Product Settings" cols={2}>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="enableProduct"
                  checked={formData.enableProduct || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Enable Product</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="perpetual"
                  checked={formData.perpetual || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Perpetual</span>
              </label>
            </div>
          </Form>
        </div>

        {validationErrors.submit && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.submit}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={createTemplate}
              onChange={(e) => setCreateTemplate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-zinc-300">
              Do you want to create a new template
            </span>
          </label>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/inventory/product/productList")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

