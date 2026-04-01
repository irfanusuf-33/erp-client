"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Select from "@/components/ui/form/Select";
import { showSuccess, showError } from "@/lib/toast";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getProductForEdit, updateProduct, searchCategories, searchWarehouses } = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({ productId: "", name: "", manufacturerProductId: "", brand: "", lowStockThreshold: "", unitOfMeasure: "", value: "", shortDescription: "", longDescription: "", inventory: { allocation: "", inStockDate: "", backorderQty: "", preOrderQty: "" }, warehouses: [{ warehouseId: "", ats: "" }], pricingDetails: [], category: [], enable: false, perpetual: false });
  const [updatedForm, setUpdatedForm] = useState<any>({});
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [warehouseSearches, setWarehouseSearches] = useState<Record<number, string>>({});
  const [filteredWarehouses, setFilteredWarehouses] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await getProductForEdit(id);
      if (res && !res.success === false) { setFormData(res); }
      setLoading(false);
    })();
  }, [id]);

  const handleInput = (field: string, value: any) => {
    setFormData((p: any) => ({ ...p, [field]: value }));
    setUpdatedForm((p: any) => ({ ...p, [field]: value }));
  };

  const handleInventory = (field: string, value: any) => {
    setFormData((p: any) => ({ ...p, inventory: { ...p.inventory, [field]: value } }));
    setUpdatedForm((p: any) => ({ ...p, inventory: { ...p.inventory, [field]: value } }));
  };

  const handleWarehouseChange = (index: number, field: string, value: any) => {
    const whs = [...formData.warehouses]; whs[index] = { ...whs[index], [field]: value };
    setFormData((p: any) => ({ ...p, warehouses: whs }));
    setUpdatedForm((p: any) => ({ ...p, warehouses: whs }));
  };

  const handlePricingChange = (index: number, field: string, value: string) => {
    const pricing = formData.pricingDetails.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item);
    setFormData((p: any) => ({ ...p, pricingDetails: pricing }));
    setUpdatedForm((p: any) => ({ ...p, pricingDetails: pricing }));
  };

  const searchCatsAPI = useCallback(async (term: string) => {
    if (!term.trim()) { setFilteredCategories([]); return; }
    const res = await searchCategories(term);
    setFilteredCategories(res.success ? res.data : []);
  }, [searchCategories]);

  useEffect(() => {
    const t = setTimeout(() => searchCatsAPI(categorySearch), 300);
    return () => clearTimeout(t);
  }, [categorySearch, searchCatsAPI]);

  const searchWhAPI = useCallback(async (term: string, index: number) => {
    if (!term.trim()) { setFilteredWarehouses((p) => ({ ...p, [index]: [] })); return; }
    const res = await searchWarehouses(term);
    setFilteredWarehouses((p) => ({ ...p, [index]: res.success ? res.data : [] }));
  }, [searchWarehouses]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProduct(formData.productId, updatedForm);
      if (res.success) {
        showSuccess("Product Updated", "Product updated successfully.");
        router.push(`/inventory/product/productDetails/${formData.productId}`);
      }
    } catch (error: any) {
      showError("Error", "Failed to update product");
    } finally { setSaving(false); }
  };

  const formatDate = (d: string) => d ? new Date(d).toISOString().split("T")[0] : "";

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  const uomOptions = [{ value: "kilograms", label: "Kilograms (kg)" }, { value: "kilowatt", label: "Kilowatt (kW)" }, { value: "piece", label: "Piece" }, { value: "pack", label: "Pack" }, { value: "pair", label: "Pair" }, { value: "roll", label: "Roll" }, { value: "gram", label: "Gram (g)" }, { value: "liter", label: "Liter (L)" }, { value: "meter", label: "Meter (m)" }];
  const currencyOptions = [{ value: "EUR", label: "Euro / EUR" }, { value: "USD", label: "US Dollar / USD" }, { value: "INR", label: "Indian Rupee / INR" }, { value: "SAR", label: "Saudi Riyal / SAR" }, { value: "CAD", label: "Canadian Dollar / CAD" }];

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 pl-2 mb-6">Edit Product</h1>

      <form className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl px-9 pt-10 pb-10 flex flex-col gap-8" onSubmit={handleSave}>

        {/* Product Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Product Details</h3>
          <div className="grid grid-cols-2 gap-8">
            <InputField label="Product ID" value={formData.productId || ""} onChange={(e) => handleInput("productId", e.target.value)} placeholder="e.g, PROD-2024-00001" />
            <InputField label="Display Name" value={formData.name || ""} onChange={(e) => handleInput("name", e.target.value)} placeholder="e.g, Product name 00012" />
            <InputField label="Manufacturer Product ID" value={formData.manufacturerProductId || ""} onChange={(e) => handleInput("manufacturerProductId", e.target.value)} placeholder="e.g, SR-ETIR-012" />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Category</label>
              <div className="relative">
                <div className="border border-gray-300 dark:border-zinc-800 rounded-lg p-2 min-h-[42px]">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {(formData.category || []).map((cid: string) => (
                      <span key={cid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {cid}<button type="button" onClick={() => handleInput("category", formData.category.filter((c: string) => c !== cid))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                  <Input placeholder="Search categories..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="border-0 p-0 h-auto text-sm focus-visible:ring-0" />
                </div>
                {categorySearch && filteredCategories.length > 0 && (
                  <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                    {filteredCategories.map((cat: any) => (
                      <div key={cat._id} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => { if (!(formData.category || []).includes(cat.categoryId)) handleInput("category", [...(formData.category || []), cat.categoryId]); setCategorySearch(""); setFilteredCategories([]); }}>
                        <div className="font-medium">{cat.categoryName}</div><div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <InputField label="Brand" value={formData.brand || ""} onChange={(e) => handleInput("brand", e.target.value)} placeholder="e.g, Brand of the product" />
            <Select label="Unit of Measure" options={uomOptions} placeholder="Select unit" defaultValue={formData.unitOfMeasure || ""} onChange={(v) => handleInput("unitOfMeasure", v)} />
            <InputField label="Value" value={formData.value || ""} onChange={(e) => handleInput("value", e.target.value)} placeholder="Enter value" />
            <div className="col-span-2"><TextArea label="Short Description" id="shortDesc" placeholder="A brief summary of the product" rows={2} value={formData.shortDescription || ""} onChange={(e) => handleInput("shortDescription", e.target.value)} /></div>
            <div className="col-span-2"><TextArea label="Long Description" id="longDesc" placeholder="Detailed product description" rows={4} value={formData.longDescription || ""} onChange={(e) => handleInput("longDescription", e.target.value)} /></div>
          </div>
        </div>

        {/* Inventory Management */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Inventory Management</h3>
          <div className="grid grid-cols-2 gap-8">
            <InputField label="Allocation" type="number" value={formData.inventory?.allocation || ""} onChange={(e) => handleInventory("allocation", e.target.value)} placeholder="200" />
            <InputField label="In-Stock Date" type="date" value={formatDate(formData.inventory?.inStockDate)} onChange={(e) => handleInventory("inStockDate", new Date(e.target.value).toISOString())} />
            <InputField label="Backorder Quantity" type="number" value={formData.inventory?.backorderQty || ""} onChange={(e) => handleInventory("backorderQty", e.target.value)} placeholder="50" />
            <InputField label="Preorder Quantity" type="number" value={formData.inventory?.preOrderQty || ""} onChange={(e) => handleInventory("preOrderQty", e.target.value)} placeholder="100" />
            <InputField label="Low Stock Threshold" value={formData.lowStockThreshold || ""} onChange={(e) => handleInput("lowStockThreshold", e.target.value)} placeholder="Enter minimum quantity for alert" />
          </div>
        </div>

        {/* Warehouse Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-4">Warehouse Details</h3>
          {(formData.warehouses || []).map((wh: any, i: number) => (
            <div key={i} className="grid grid-cols-2 gap-8 bg-blue-50 dark:bg-blue-900/10 px-9 py-6 mb-2.5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Warehouse {i + 1} ID</label>
                <div className="relative">
                  <Input placeholder="Search and select warehouse..." value={warehouseSearches[i] || wh.warehouseId || ""} onChange={(e) => { setWarehouseSearches((p) => ({ ...p, [i]: e.target.value })); const t = setTimeout(() => searchWhAPI(e.target.value, i), 300); return () => clearTimeout(t); }} />
                  {warehouseSearches[i] && filteredWarehouses[i]?.length > 0 && (
                    <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                      {filteredWarehouses[i].map((w: any) => (
                        <div key={w._id} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => { handleWarehouseChange(i, "warehouseId", w.warehouseId); setWarehouseSearches((p) => ({ ...p, [i]: "" })); setFilteredWarehouses((p) => ({ ...p, [i]: [] })); }}>
                          <div className="font-medium">{w.name}</div><div className="text-xs text-gray-500">ID: {w.warehouseId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <InputField label="ATS (Available to Sell)" type="number" value={wh.ats || ""} onChange={(e) => handleWarehouseChange(i, "ats", e.target.value)} placeholder="0" />
            </div>
          ))}
          <button type="button" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-bold mt-2" onClick={() => { const whs = [...formData.warehouses, { warehouseId: "", ats: "" }]; setFormData((p: any) => ({ ...p, warehouses: whs })); setUpdatedForm((p: any) => ({ ...p, warehouses: whs })); }}>
            <Plus size={16} />Add Warehouse
          </button>
        </div>

        {/* Pricing Details */}
        <div className="bg-blue-50 dark:bg-blue-900/10 px-9 py-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Pricing Details</h3>
          {(formData.pricingDetails || []).map((entry: any, i: number) => (
            <div key={i} className="grid grid-cols-2 gap-8 mb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Currency</label>
                  {(formData.pricingDetails?.length || 0) > 1 && i > 0 && <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => { const p = formData.pricingDetails.filter((_: any, j: number) => j !== i); setFormData((f: any) => ({ ...f, pricingDetails: p })); setUpdatedForm((f: any) => ({ ...f, pricingDetails: p })); }}><X size={14} /></button>}
                </div>
                <Select options={currencyOptions} defaultValue={entry.currency} onChange={(v) => handlePricingChange(i, "currency", v)} />
              </div>
              <div />
              <InputField label="Cut off Price" type="text" placeholder="0.00" value={entry.cutOffPrice || ""} onChange={(e) => handlePricingChange(i, "cutOffPrice", e.target.value)} />
              <InputField label="Price" type="text" placeholder="0.00" value={entry.price || ""} onChange={(e) => handlePricingChange(i, "price", e.target.value)} />
            </div>
          ))}
          <button type="button" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-bold" onClick={() => { const p = [...(formData.pricingDetails || []), { currency: "", cutOffPrice: "", price: "" }]; setFormData((f: any) => ({ ...f, pricingDetails: p })); setUpdatedForm((f: any) => ({ ...f, pricingDetails: p })); }}>
            <Plus size={16} />Add Currency
          </button>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-8">
          <label className="flex items-center gap-4 cursor-pointer">
            <h3 className="text-base font-semibold text-gray-800 dark:text-zinc-100">Enable Product</h3>
            <input type="checkbox" className="appearance-none w-7 h-3.5 rounded-full bg-gray-300 relative cursor-pointer transition-colors checked:bg-amber-400 after:content-[''] after:absolute after:top-1/2 after:left-0.5 after:w-2.5 after:h-2.5 after:rounded-full after:bg-white after:-translate-y-1/2 after:transition-all checked:after:translate-x-3.5" checked={formData.enable || false} onChange={(e) => handleInput("enable", e.target.checked)} />
          </label>
          <label className="flex items-center gap-4 cursor-pointer">
            <h3 className="text-base font-semibold text-gray-800 dark:text-zinc-100">Perpetual</h3>
            <input type="checkbox" className="appearance-none w-7 h-3.5 rounded-full bg-gray-300 relative cursor-pointer transition-colors checked:bg-amber-400 after:content-[''] after:absolute after:top-1/2 after:left-0.5 after:w-2.5 after:h-2.5 after:rounded-full after:bg-white after:-translate-y-1/2 after:transition-all checked:after:translate-x-3.5" checked={formData.perpetual || false} onChange={(e) => handleInput("perpetual", e.target.checked)} />
          </label>
        </div>

        <div className="flex justify-end gap-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
