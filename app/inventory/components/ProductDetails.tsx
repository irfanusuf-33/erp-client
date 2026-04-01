"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Save, X, Plus } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Select from "@/components/ui/form/Select";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/toast";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getSingleProduct, updateProduct, searchCategories, searchWarehouses } = useGlobalStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [warehouseSearches, setWarehouseSearches] = useState<Record<number, string>>({});
  const [filteredWarehouses, setFilteredWarehouses] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getSingleProduct(id);
        setProduct(data); setEdited(data);
      } catch { } finally { setLoading(false); }
    })();
  }, [id]);

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

  const handleChange = (field: string, value: any) => setEdited((p: any) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProduct(product.productId, edited, edited.newImages || [], edited.images || []);
      if (res.success) {
        showSuccess("Product Updated", "Product updated successfully.");
        const refreshed = await getSingleProduct(id!);
        setProduct(refreshed); setEdited(refreshed); setIsEditing(false);
      }
    } catch {
      showError("Update Failed", "Failed to update product");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;
  if (!product) return <div className="p-12 text-center text-gray-500">Product not found</div>;

  const Field = ({ label, value, editNode }: { label: string; value: any; editNode?: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{label}</p>
      {isEditing && editNode ? editNode : <p className="text-sm font-normal text-gray-800 dark:text-zinc-100">{value || "N/A"}</p>}
    </div>
  );

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 pl-2 mb-6">Product Details</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-9 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Product Details</h2>
          {!isEditing ? (
            <button className="text-blue-600 hover:text-blue-700 transition-colors mr-8" onClick={() => setIsEditing(true)}><Edit2 size={18} /></button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEdited(product); }}><X size={14} className="mr-1" />Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}><Save size={14} className="mr-1" />{saving ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </div>

        {/* Product fields grid */}
        <div className="flex flex-wrap gap-x-[15%] gap-y-10 pt-6">
          <div className="flex flex-col gap-10 w-[250px]">
            <Field label="Product ID" value={product.productId} />
            <Field label="Brand" value={product.brand} editNode={<InputField value={edited?.brand || ""} onChange={(e) => handleChange("brand", e.target.value)} />} />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Category</p>
              {isEditing ? (
                <div className="relative">
                  <div className="border border-gray-300 dark:border-zinc-800 rounded-lg p-2 min-h-[42px]">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {(edited?.category || []).map((cid: string) => (
                        <span key={cid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {cid}<button type="button" onClick={() => handleChange("category", edited.category.filter((c: string) => c !== cid))} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <Input placeholder="Search categories..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="border-0 p-0 h-auto text-sm focus-visible:ring-0" />
                  </div>
                  {categorySearch && filteredCategories.length > 0 && (
                    <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                      {filteredCategories.map((cat: any) => (
                        <div key={cat._id} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => { if (!(edited?.category || []).includes(cat.categoryId)) handleChange("category", [...(edited?.category || []), cat.categoryId]); setCategorySearch(""); setFilteredCategories([]); }}>
                          <div className="font-medium">{cat.categoryName}</div>
                          <div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : <p className="text-sm text-gray-800 dark:text-zinc-100">{product?.category?.[0] || "N/A"}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-10 w-[250px]">
            <Field label="Display Name" value={product.name} editNode={<InputField value={edited?.name || ""} onChange={(e) => handleChange("name", e.target.value)} />} />
            <Field label="Low Stock Threshold" value={product.lowStockThreshold} editNode={<InputField type="number" value={edited?.lowStockThreshold || ""} onChange={(e) => handleChange("lowStockThreshold", e.target.value)} />} />
          </div>

          <div className="flex flex-col gap-10 w-[250px]">
            <Field label="Manufacturer Product ID" value={product.manufacturerProductId} editNode={<InputField value={edited?.manufacturerProductId || ""} onChange={(e) => handleChange("manufacturerProductId", e.target.value)} />} />
            <Field label="Unit of Measure" value={product.unitOfMeasure} editNode={
              <Select options={[{ value: "kilograms", label: "Kilograms (kg)" }, { value: "piece", label: "Piece" }, { value: "pack", label: "Pack" }, { value: "liter", label: "Liter (L)" }, { value: "meter", label: "Meter (m)" }]} defaultValue={edited?.unitOfMeasure || ""} onChange={(v) => handleChange("unitOfMeasure", v)} />
            } />
            <Field label="Value" value={product.value} editNode={<InputField value={edited?.value || ""} onChange={(e) => handleChange("value", e.target.value)} />} />
          </div>
        </div>

        {/* Descriptions */}
        <div className="mt-10">
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-2">Short Description</p>
          {isEditing ? <TextArea rows={2} value={edited?.shortDescription || ""} onChange={(e) => handleChange("shortDescription", e.target.value)} /> : <p className="text-sm text-gray-800 dark:text-zinc-100">{product.shortDescription || "No description available"}</p>}
        </div>
        <div className="mt-10">
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-2">Long Description</p>
          {isEditing ? <TextArea rows={4} value={edited?.longDescription || ""} onChange={(e) => handleChange("longDescription", e.target.value)} /> : <p className="text-sm text-gray-800 dark:text-zinc-100">{product.longDescription || "No description available"}</p>}
        </div>

        {/* Inventory Management */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Inventory Management</h3>
          <div className="flex gap-[15%] flex-wrap">
            {[["In-Stock Date", product?.inventory?.inStockDate ? new Date(product.inventory.inStockDate).toLocaleDateString() : "N/A", "date", "inStockDate"],
              ["Allocation", product?.inventory?.allocation ?? 0, "number", "allocation"],
              ["Backorder Qty", product?.inventory?.backorderQty ?? 0, "number", "backorderQty"],
              ["Preorder Qty", product?.inventory?.preOrderQty ?? 0, "number", "preOrderQty"]
            ].map(([label, val, type, field]) => (
              <div key={field as string} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{label as string}</p>
                {isEditing ? <InputField type={type as string} value={edited?.inventory?.[field as string] || ""} onChange={(e) => handleChange("inventory", { ...edited?.inventory, [field as string]: e.target.value })} /> : <p className="text-sm text-gray-800 dark:text-zinc-100">{String(val)}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Warehouses */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Warehouse Details</h3>
            {isEditing && <Button variant="outline" size="sm" onClick={() => handleChange("warehouses", [...(edited?.warehouses || []), { warehouseId: "", ats: 0 }])}><Plus size={14} className="mr-1" />Add Warehouse</Button>}
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-4">
              {(edited?.warehouses || []).map((wh: any, i: number) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input placeholder="Search warehouse..." value={warehouseSearches[i] || wh.warehouseId} onChange={(e) => { setWarehouseSearches((p) => ({ ...p, [i]: e.target.value })); const t = setTimeout(() => searchWhAPI(e.target.value, i), 300); return () => clearTimeout(t); }} />
                    {warehouseSearches[i] && filteredWarehouses[i]?.length > 0 && (
                      <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                        {filteredWarehouses[i].map((w: any) => (
                          <div key={w._id} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => { const updated = [...edited.warehouses]; updated[i] = { ...updated[i], warehouseId: w.warehouseId }; handleChange("warehouses", updated); setWarehouseSearches((p) => ({ ...p, [i]: "" })); setFilteredWarehouses((p) => ({ ...p, [i]: [] })); }}>
                            <div className="font-medium">{w.name}</div><div className="text-xs text-gray-500">ID: {w.warehouseId}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <InputField label="ATS" type="number" value={wh.ats || ""} onChange={(e) => { const updated = [...edited.warehouses]; updated[i] = { ...updated[i], ats: e.target.value }; handleChange("warehouses", updated); }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-[15%] flex-wrap">
              {(product?.warehouses || []).map((wh: any, i: number) => (
                <div key={i} className="flex flex-col gap-4">
                  <div><p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Warehouse ID</p><p className="text-sm mt-2 text-gray-800 dark:text-zinc-100">{wh.warehouseId || "N/A"}</p></div>
                  <div><p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">ATS</p><p className="text-sm mt-2 text-gray-800 dark:text-zinc-100">{wh.ats ?? 0}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Pricing Details</h3>
            {isEditing && <Button variant="outline" size="sm" onClick={() => handleChange("pricingDetails", [...(edited?.pricingDetails || []), { currency: "EUR", cutOffPrice: "", costPrice: "", price: "" }])}><Plus size={14} className="mr-1" />Add Currency</Button>}
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-4">
              {(edited?.pricingDetails || []).map((p: any, i: number) => (
                <div key={i} className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Currency {i + 1}</span>
                    {i > 0 && <button className="text-red-500 hover:text-red-700" onClick={() => handleChange("pricingDetails", edited.pricingDetails.filter((_: any, j: number) => j !== i))}><X size={14} /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select options={[{ value: "EUR", label: "Euro / EUR" }, { value: "USD", label: "US Dollar / USD" }, { value: "INR", label: "Indian Rupee / INR" }, { value: "SAR", label: "Saudi Riyal / SAR" }]} defaultValue={p.currency} onChange={(v) => { const updated = [...edited.pricingDetails]; updated[i] = { ...updated[i], currency: v }; handleChange("pricingDetails", updated); }} />
                    <InputField label="Cut off Price" type="text" placeholder="$ 0.00" value={p.cutOffPrice || ""} onChange={(e) => { const updated = [...edited.pricingDetails]; updated[i] = { ...updated[i], cutOffPrice: e.target.value }; handleChange("pricingDetails", updated); }} />
                    <InputField label="Cost Price" type="text" placeholder="$ 0.00" value={p.costPrice || ""} onChange={(e) => { const updated = [...edited.pricingDetails]; updated[i] = { ...updated[i], costPrice: e.target.value }; handleChange("pricingDetails", updated); }} />
                    <InputField label="Selling Price" type="text" placeholder="$ 0.00" value={p.price || ""} onChange={(e) => { const updated = [...edited.pricingDetails]; updated[i] = { ...updated[i], price: e.target.value }; handleChange("pricingDetails", updated); }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {(product?.pricingDetails || []).map((p: any, i: number) => (
                <div key={i} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4">Currency {i + 1} — {p.currency}</h4>
                  <div className="grid grid-cols-3 gap-5">
                    {[["Cut off Price", p.cutOffPrice], ["Cost Price", p.costPrice], ["Selling Price", p.price]].map(([l, v]) => (
                      <div key={l as string}><p className="text-xs text-gray-500 mb-1">{l as string}</p><p className="text-base font-medium text-gray-900 dark:text-zinc-100">${v || 0}</p></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-4">Product Images</h3>
          <div className="grid grid-cols-2 gap-5">
            {(product?.images || []).map((img: any, i: number) => (
              <div key={i} className="text-center">
                <img src={img.url} alt={img.filename} className="w-full h-[350px] object-cover rounded-lg" />
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{img.filename}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-28 text-sm text-gray-500 dark:text-zinc-400 font-semibold">Updated By {product?.updatedBy || "Unknown"}</div>
      </div>
    </div>
  );
}
