"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateProduct() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { addProduct, generateProductId, saveProductTemplate, getTemplate, searchCategories, searchWarehouses } = useGlobalStore();

  const [formData, setFormData] = useState<Record<string, any>>({
    templateId: templateId || "baseTemplate",
    productId: "", displayName: "", manufacturerId: "", brand: "",
    lowStockThreshold: "", uom: "", value: "", shortDesc: "", longDesc: "",
    allocation: "", backorderQty: "", preorderQty: "", instockDate: "",
    category: [], enableProduct: false, perpetual: false,
  });
  const [pricingEntries, setPricingEntries] = useState([{ currency: "EUR", cutOffPrice: "249.99", costPrice: "279.99", price: "299.99" }]);
  const [warehouseEntries, setWarehouseEntries] = useState([{ warehouseId: "", ats: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [warehouseSearches, setWarehouseSearches] = useState<Record<number, string>>({});
  const [filteredWarehouses, setFilteredWarehouses] = useState<Record<number, any[]>>({});
  const [createTemplate, setCreateTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchCategoriesAPI = useCallback(async (term: string) => {
    if (term.trim()) {
      const result = await searchCategories(term);
      setFilteredCategories(result.success ? result.data : []);
    } else setFilteredCategories([]);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchCategoriesAPI(categorySearch), 300);
    return () => clearTimeout(t);
  }, [categorySearch, searchCategoriesAPI]);

  const searchWarehousesAPI = useCallback(async (term: string, index: number) => {
    if (term.trim()) {
      const result = await searchWarehouses(term);
      setFilteredWarehouses((prev) => ({ ...prev, [index]: result.success ? result.data : [] }));
    } else setFilteredWarehouses((prev) => ({ ...prev, [index]: [] }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [id]: finalValue }));
  };

  const handleGenerateId = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGeneratingId(true);
    const result = await generateProductId();
    // result = { success, data: { productId } }
    if (result?.success && result?.data?.productId) {
      setFormData((prev) => ({ ...prev, productId: result.data.productId }));
    }
    setIsGeneratingId(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.productId) newErrors.productId = "Product ID is required";
    if (!formData.displayName) newErrors.displayName = "Display Name is required";
    if (!formData.category?.length) newErrors.category = "At least one category is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
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
      warehouses: warehouseEntries.map((e) => ({ warehouseId: e.warehouseId, ats: parseInt(e.ats) || 0 })),
      pricingDetails: pricingEntries.map((e) => ({ currency: e.currency, cutOffPrice: parseFloat(e.cutOffPrice) || 0, costPrice: parseFloat(e.costPrice) || 0, price: parseFloat(e.price) || 0 })),
      inventory: { allocation: parseInt(formData.allocation) || 0, perpetual: formData.perpetual || false, backorderQty: parseInt(formData.backorderQty) || 0, preOrderQty: parseInt(formData.preorderQty) || 0, inStockDate: formData.instockDate ? new Date(formData.instockDate).toISOString() : new Date().toISOString(), inStockFlag: true },
    };
    const result = await addProduct(productData, formData.productImages || []);
    if (result.success) router.push("/inventory/product/productList");
    setIsSubmitting(false);
  };

  const handleTemplateSubmit = async () => {
    setIsSubmitting(true);
    const result = await saveProductTemplate({ templateName, templateDesc, groups: [] });
    if (result.success) { setShowTemplateModal(false); router.push("/inventory/product/templates"); }
    setIsSubmitting(false);
  };

  return (
    <div className="create-product-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Product</h1>

      <form onSubmit={handleSaveProduct}>
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Product Details</h2>
          <p className="text-sm text-gray-500 mb-4">*Required field</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Product ID <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <Input id="productId" placeholder="e.g, PROD-2024-00001" value={formData.productId || ""} onChange={handleChange} required />
                <Button variant="outline" size="sm" onClick={handleGenerateId} disabled={isGeneratingId} type="button">
                  {isGeneratingId ? "Generating..." : "Generate ID"}
                </Button>
              </div>
              {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Display Name <span className="text-red-500">*</span></label>
              <Input id="displayName" placeholder="e.g, Product name 00012" value={formData.displayName || ""} onChange={handleChange} required />
              {errors.displayName && <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Manufacturer Product ID <span className="text-red-500">*</span></label>
              <Input id="manufacturerId" placeholder="e.g, SR-ETIR-012" value={formData.manufacturerId || ""} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Brand <span className="text-red-500">*</span></label>
              <Input id="brand" placeholder="e.g, Brand of the product" value={formData.brand || ""} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Unit of Measure <span className="text-red-500">*</span></label>
              <select id="uom" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.uom || ""} onChange={handleChange}>
                <option value="">Select unit</option>
                {["kilograms","kilowatt","piece","pack","pair","roll","gram","liter","meter"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Value <span className="text-red-500">*</span></label>
              <Input id="value" placeholder="Enter value" value={formData.value || ""} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Category <span className="text-red-500">*</span></label>
              <div className={`border rounded-lg p-1 min-h-9 flex flex-wrap gap-1 items-center ${errors.category ? "border-red-500" : "border-input"}`}>
                {(formData.category || []).map((catId: string) => (
                  <span key={catId} className="inline-flex items-center bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs gap-1">
                    {catId}
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, category: prev.category.filter((id: string) => id !== catId) }))}>×</button>
                  </span>
                ))}
                <input type="text" className="border-none outline-none flex-1 min-w-24 text-sm bg-transparent px-1" placeholder="Search and select categories..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
              </div>
              {categorySearch && filteredCategories.length > 0 && (
                <div className="border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                  {filteredCategories.map((cat) => (
                    <div key={cat._id} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => { if (!formData.category.includes(cat.categoryId)) setFormData((prev) => ({ ...prev, category: [...prev.category, cat.categoryId] })); setCategorySearch(""); setFilteredCategories([]); }}>
                      <div className="font-medium">{cat.categoryName}</div>
                      <div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Short Description <span className="text-red-500">*</span></label>
              <textarea id="shortDesc" className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={2} placeholder="A brief summary of the product" value={formData.shortDesc || ""} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Long Description <span className="text-red-500">*</span></label>
              <textarea id="longDesc" className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={4} placeholder="Detailed product description, features, and benefits" value={formData.longDesc || ""} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Inventory Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "allocation", label: "Allocation", type: "number", placeholder: "200" },
              { id: "instockDate", label: "In-Stock Date", type: "date", placeholder: "" },
              { id: "backorderQty", label: "Backorder Quantity", type: "number", placeholder: "50" },
              { id: "preorderQty", label: "Preorder Quantity", type: "number", placeholder: "100" },
              { id: "lowStockThreshold", label: "Low Stock Threshold", type: "text", placeholder: "Enter minimum quantity for alert, e.g. 19" },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id}>
                <label className="text-sm font-medium mb-1 block">{label} <span className="text-red-500">*</span></label>
                <Input id={id} type={type} placeholder={placeholder} value={formData[id] || ""} onChange={handleChange} />
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Warehouse Details</h2>
            <Button variant="outline" size="sm" type="button" onClick={() => setWarehouseEntries((prev) => [...prev, { warehouseId: "", ats: "" }])}>
              Add Warehouse
            </Button>
          </div>
          {warehouseEntries.map((entry, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="text-sm font-medium mb-1 block">Warehouse ID <span className="text-red-500">*</span></label>
                <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search and select warehouse..." value={warehouseSearches[index] || entry.warehouseId} onChange={(e) => { setWarehouseSearches((prev) => ({ ...prev, [index]: e.target.value })); const t = setTimeout(() => searchWarehousesAPI(e.target.value, index), 300); return () => clearTimeout(t); }} />
                {warehouseSearches[index] && filteredWarehouses[index]?.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredWarehouses[index].map((wh) => (
                      <div key={wh._id} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => { setWarehouseEntries((prev) => prev.map((e, i) => i === index ? { ...e, warehouseId: wh.warehouseId } : e)); setWarehouseSearches((prev) => ({ ...prev, [index]: "" })); setFilteredWarehouses((prev) => ({ ...prev, [index]: [] })); }}>
                        <div className="font-medium">{wh.name}</div>
                        <div className="text-xs text-gray-500">ID: {wh.warehouseId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ATS (Available to Sell) <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={entry.ats} onChange={(e) => setWarehouseEntries((prev) => prev.map((en, i) => i === index ? { ...en, ats: e.target.value } : en))} />
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pricing Details</h2>
            <Button variant="outline" size="sm" type="button" onClick={() => setPricingEntries((prev) => [...prev, { ...prev[prev.length - 1] }])}>
              Add Currency
            </Button>
          </div>
          {pricingEntries.map((entry, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium">Currency {index + 1}</label>
                {pricingEntries.length > 1 && index > 0 && (
                  <button type="button" onClick={() => setPricingEntries((prev) => prev.filter((_, i) => i !== index))} className="text-red-500 text-sm">Remove</button>
                )}
              </div>
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm mb-3" value={entry.currency} onChange={(e) => setPricingEntries((prev) => prev.map((en, i) => i === index ? { ...en, currency: e.target.value } : en))}>
                {["EUR","USD","INR","SAR","CAD"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                {[["cutOffPrice","Cut off Price"],["costPrice","Cost Price"],["price","Selling Price"]].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-sm font-medium mb-1 block">{label}</label>
                    <Input type="text" placeholder="$ 0.00" value={(entry as any)[field]} onChange={(e) => setPricingEntries((prev) => prev.map((en, i) => i === index ? { ...en, [field]: e.target.value } : en))} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Product Settings */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Product Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium">Enable Product</span>
              <input className="w-4 h-4" type="checkbox" id="enableProduct" checked={formData.enableProduct || false} onChange={handleChange} />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium">Perpetual</span>
              <input className="w-4 h-4" type="checkbox" id="perpetual" checked={formData.perpetual || false} onChange={handleChange} />
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          {!templateId && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={createTemplate} onChange={(e) => setCreateTemplate(e.target.checked)} />
              Do you want to create a new template
            </label>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" type="button" onClick={() => router.push("/inventory/product/productList")}>Cancel</Button>
            {createTemplate ? (
              <Button size="sm" type="button" onClick={() => setShowTemplateModal(true)} disabled={isSubmitting}>
                {isSubmitting ? "Saving Template..." : "Create Template"}
              </Button>
            ) : (
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving Product..." : "Save Product"}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="font-semibold text-lg mb-4">Save Template</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Template Name</label>
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Enter template name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Template Description</label>
                <textarea className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={3} value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} placeholder="Enter template description" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleTemplateSubmit} disabled={!templateName.trim() || isSubmitting}>Save Template</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
