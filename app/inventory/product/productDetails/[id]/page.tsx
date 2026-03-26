"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryProductDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getSingleProduct, updateProduct, searchCategories, searchWarehouses } = useGlobalStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [warehouseSearches, setWarehouseSearches] = useState<Record<number, string>>({});
  const [filteredWarehouses, setFilteredWarehouses] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (id) {
      getSingleProduct(id)
        .then((data) => { setProduct(data); setEditedProduct(data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  // searchCategories returns { success, data: items[] }
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

  // searchWarehouses returns { success, data: items[] }
  const searchWarehousesAPI = useCallback(async (term: string, index: number) => {
    if (term.trim()) {
      const result = await searchWarehouses(term);
      setFilteredWarehouses((prev) => ({ ...prev, [index]: result.success ? result.data : [] }));
    } else setFilteredWarehouses((prev) => ({ ...prev, [index]: [] }));
  }, []);

  const handleWarehouseSearch = (term: string, index: number) => {
    setWarehouseSearches((prev) => ({ ...prev, [index]: term }));
    const t = setTimeout(() => searchWarehousesAPI(term, index), 300);
    return () => clearTimeout(t);
  };

  const handleChange = (field: string, value: any) =>
    setEditedProduct((prev: any) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateProduct(product.productId, editedProduct, editedProduct.newImages || [], editedProduct.images || []);
      if (result.success) {
        const refreshed = await getSingleProduct(id!);
        setProduct(refreshed); setEditedProduct(refreshed); setIsEditing(false);
      }
    } catch {}
    finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!product) return <div className="p-12 text-center">Product not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/product/productList")}>← Back</Button>
        <h1 className="text-2xl font-bold">Product Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Product Details</h2>
          {!isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/product/edit/${product.productId}`)}>Edit Full</Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Quick Edit</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditedProduct(product); }}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><p className="text-xs text-gray-500 mb-1">Product ID</p><p className="font-medium">{product.productId || "N/A"}</p></div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Brand</p>
            {isEditing ? <Input value={editedProduct?.brand || ""} onChange={(e) => handleChange("brand", e.target.value)} /> : <p className="font-medium">{product.brand || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Category</p>
            {isEditing ? (
              <div className="relative">
                <div className="border border-gray-300 rounded-lg p-1 min-h-9 flex flex-wrap gap-1 items-center">
                  {(editedProduct?.category || []).map((catId: string) => (
                    <span key={catId} className="inline-flex items-center bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs gap-1">
                      {catId}
                      <button type="button" onClick={() => handleChange("category", editedProduct.category.filter((c: string) => c !== catId))}>×</button>
                    </span>
                  ))}
                  <input type="text" className="border-none outline-none flex-1 min-w-24 text-sm bg-transparent" placeholder="Search..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
                </div>
                {categorySearch && filteredCategories.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredCategories.map((cat) => (
                      <div key={cat._id || cat.categoryId} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => { if (!(editedProduct?.category || []).includes(cat.categoryId)) handleChange("category", [...(editedProduct?.category || []), cat.categoryId]); setCategorySearch(""); setFilteredCategories([]); }}>
                        <div className="font-medium">{cat.categoryName}</div>
                        <div className="text-xs text-gray-500">ID: {cat.categoryId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : <p className="font-medium">{Array.isArray(product.category) ? product.category.join(", ") : product.category || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Display Name</p>
            {isEditing ? <Input value={editedProduct?.name || ""} onChange={(e) => handleChange("name", e.target.value)} /> : <p className="font-medium">{product.name || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Low Stock Threshold</p>
            {isEditing ? <Input type="number" value={editedProduct?.lowStockThreshold || ""} onChange={(e) => handleChange("lowStockThreshold", e.target.value)} /> : <p className="font-medium">{product.lowStockThreshold || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Manufacturer Product ID</p>
            {isEditing ? <Input value={editedProduct?.manufacturerProductId || ""} onChange={(e) => handleChange("manufacturerProductId", e.target.value)} /> : <p className="font-medium">{product.manufacturerProductId || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Unit of Measure</p>
            {isEditing ? (
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={editedProduct?.unitOfMeasure || ""} onChange={(e) => handleChange("unitOfMeasure", e.target.value)}>
                <option value="">Select unit</option>
                {["kilograms","kilowatt","piece","pack","pair","roll","gram","liter","meter"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            ) : <p className="font-medium">{product.unitOfMeasure || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Value</p>
            {isEditing ? <Input value={editedProduct?.value || ""} onChange={(e) => handleChange("value", e.target.value)} /> : <p className="font-medium">{product.value || "N/A"}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${(product.enable || product.enabled) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {(product.enable || product.enabled) ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Short Description</p>
          {isEditing ? <textarea rows={2} className="w-full border border-input rounded-md px-2.5 py-1 text-sm" value={editedProduct?.shortDescription || ""} onChange={(e) => handleChange("shortDescription", e.target.value)} /> : <p className="text-sm">{product.shortDescription || "—"}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Long Description</p>
          {isEditing ? <textarea rows={4} className="w-full border border-input rounded-md px-2.5 py-1 text-sm" value={editedProduct?.longDescription || ""} onChange={(e) => handleChange("longDescription", e.target.value)} /> : <p className="text-sm">{product.longDescription || "—"}</p>}
        </div>

        {/* Inventory */}
        <div>
          <h2 className="text-base font-semibold mb-3">Inventory Management</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "In-Stock Date", field: "inStockDate", type: "date", display: product.inventory?.inStockDate ? new Date(product.inventory.inStockDate).toLocaleDateString() : "N/A" },
              { label: "Allocation", field: "allocation", type: "number", display: product.inventory?.allocation ?? 0 },
              { label: "Backorder Qty", field: "backorderQty", type: "number", display: product.inventory?.backorderQty ?? 0 },
              { label: "PreOrder Qty", field: "preOrderQty", type: "number", display: product.inventory?.preOrderQty ?? 0 },
            ].map(({ label, field, type, display }) => (
              <div key={field}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                {isEditing ? (
                  <Input type={type} value={field === "inStockDate" ? editedProduct?.inventory?.inStockDate?.split("T")[0] || "" : editedProduct?.inventory?.[field] || ""} onChange={(e) => handleChange("inventory", { ...editedProduct?.inventory, [field]: e.target.value })} />
                ) : <p className="font-medium">{display}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Warehouses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Warehouse Details</h2>
            {isEditing && <Button variant="outline" size="sm" onClick={() => handleChange("warehouses", [...(editedProduct?.warehouses || []), { warehouseId: "", ats: 0 }])}>Add Warehouse</Button>}
          </div>
          {isEditing ? (
            <div className="space-y-4">
              {editedProduct?.warehouses?.map((wh: any, index: number) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <p className="text-xs text-gray-500 mb-1">Warehouse ID</p>
                    <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search warehouse..." value={warehouseSearches[index] || wh.warehouseId} onChange={(e) => handleWarehouseSearch(e.target.value, index)} />
                    {warehouseSearches[index] && filteredWarehouses[index]?.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredWarehouses[index].map((w) => (
                          <div key={w._id || w.warehouseId} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => { const updated = [...editedProduct.warehouses]; updated[index] = { ...updated[index], warehouseId: w.warehouseId }; handleChange("warehouses", updated); setWarehouseSearches((p) => ({ ...p, [index]: "" })); setFilteredWarehouses((p) => ({ ...p, [index]: [] })); }}>
                            <div className="font-medium">{w.name}</div>
                            <div className="text-xs text-gray-500">ID: {w.warehouseId}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ATS</p>
                    <Input type="number" value={wh.ats || ""} onChange={(e) => { const updated = [...editedProduct.warehouses]; updated[index] = { ...updated[index], ats: e.target.value }; handleChange("warehouses", updated); }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.warehouses?.map((wh: any, i: number) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs text-gray-500">Warehouse ID</p><p className="font-medium text-sm">{wh.warehouseId || "N/A"}</p>
                  <p className="text-xs text-gray-500">ATS</p><p className="font-medium text-sm">{wh.ats ?? 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Pricing Details</h2>
            {isEditing && <Button variant="outline" size="sm" onClick={() => handleChange("pricingDetails", [...(editedProduct?.pricingDetails || []), { currency: "EUR", cutOffPrice: "", costPrice: "", price: "" }])}>Add Currency</Button>}
          </div>
          {isEditing ? (
            <div className="space-y-4">
              {editedProduct?.pricingDetails?.map((pricing: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium text-sm">Currency {index + 1}</label>
                    {editedProduct.pricingDetails.length > 1 && index > 0 && <button type="button" onClick={() => handleChange("pricingDetails", editedProduct.pricingDetails.filter((_: any, i: number) => i !== index))} className="text-red-500 text-sm">Remove</button>}
                  </div>
                  <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm mb-3" value={pricing.currency || ""} onChange={(e) => { const u = [...editedProduct.pricingDetails]; u[index] = { ...u[index], currency: e.target.value }; handleChange("pricingDetails", u); }}>
                    {["EUR","USD","INR","SAR","CAD"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="grid grid-cols-3 gap-3">
                    {[["cutOffPrice","Cut off Price"],["costPrice","Cost Price"],["price","Selling Price"]].map(([field, label]) => (
                      <div key={field}>
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <Input type="text" placeholder="0.00" value={pricing[field] || ""} onChange={(e) => { const u = [...editedProduct.pricingDetails]; u[index] = { ...u[index], [field]: e.target.value }; handleChange("pricingDetails", u); }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {product.pricingDetails?.map((pricing: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Currency {i + 1} — {pricing.currency}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xs text-gray-500 mb-1">Cut off Price</p><p className="font-medium">${pricing.cutOffPrice ?? 0}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Cost Price</p><p className="font-medium">${pricing.costPrice ?? 0}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Selling Price</p><p className="font-medium">${pricing.price ?? 0}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {product.images?.length > 0 && (
          <div>
            <h2 className="text-base font-semibold mb-3">Product Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.images.map((image: any, i: number) => (
                <div key={i} className="text-center">
                  <img src={image.url} alt={image.filename} className="w-full h-40 object-cover rounded-lg" />
                  <p className="mt-1 text-xs text-gray-500">{image.filename}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">Updated by: {product.updatedBy || "Unknown"}</p>
      </div>
    </div>
  );
}
