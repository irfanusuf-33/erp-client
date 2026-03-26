"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryEditProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getProductForEdit, updateProduct } = useGlobalStore();
  const [formData, setFormData] = useState<Record<string, any>>({
    productId: "", name: "", manufacturerProductId: "", brand: "", lowStockThreshold: "",
    unitOfMeasure: "", value: "", shortDescription: "", longDescription: "",
    inventory: { ats: "", allocation: "", perpetual: false, backorderQty: "", preOrderQty: "" },
    warehouses: [{ warehouseId: "", ats: "" }], pricingDetails: [], category: [], enable: false, perpetual: false,
  });
  const [updatedForm, setUpdatedForm] = useState<Record<string, any>>({});
  const [newGroups, setNewGroups] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      getProductForEdit(id).then((res: any) => {
        // getProductForEdit returns the product object directly (unwrapped)
        if (res && res.productId) {
          setFormData(res);
          const existingGroups = ["Product Details", "Inventory Management", "Warehouse Details", "Pricing"];
          const customGroups: any[] = [];
          res.customFields?.forEach((custom: any) => {
            if (!existingGroups.includes(custom.group)) customGroups.push(custom);
          });
          if (customGroups.length > 0) setNewGroups(customGroups);
        }
      });
    }
  }, [id]);

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setUpdatedForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleInventoryChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, inventory: { ...prev.inventory, [id]: value } }));
    setUpdatedForm((prev) => ({ ...prev, inventory: { ...prev.inventory, [id]: value } }));
  };

  const handleWarehouseChange = (id: string, i: number, value: any) => {
    const warehouseArray = [...formData.warehouses];
    warehouseArray[i] = { ...warehouseArray[i], [id]: value };
    setFormData((prev) => ({ ...prev, warehouses: warehouseArray }));
    setUpdatedForm((prev) => ({ ...prev, warehouses: warehouseArray }));
  };

  const handlePricingChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({ ...prev, pricingDetails: prev.pricingDetails.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item) }));
    setUpdatedForm((prev) => ({ ...prev, pricingDetails: formData.pricingDetails.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item) }));
  };

  const handleAddWarehouse = () => {
    const warehouse = [...formData.warehouses, { warehouseId: "", ats: "" }];
    setFormData((prev) => ({ ...prev, warehouses: warehouse }));
    setUpdatedForm((prev) => ({ ...prev, warehouses: warehouse }));
  };

  const handleAddCurrency = () => {
    setFormData((prev) => ({ ...prev, pricingDetails: [...prev.pricingDetails, { currency: "", cutOffPrice: "", price: "" }] }));
    setUpdatedForm((prev) => ({ ...prev, pricingDetails: [...(prev.pricingDetails || []), { currency: "", cutOffPrice: "", price: "" }] }));
  };

  const handleRemovePricingEntry = (index: number) => {
    if (formData.pricingDetails.length > 1) {
      setFormData((prev) => ({ ...prev, pricingDetails: prev.pricingDetails.filter((_: any, i: any) => i !== index) }));
      setUpdatedForm((prev) => ({ ...prev, pricingDetails: (prev.pricingDetails || []).filter((_: any, i: any) => i !== index) }));
    }
  };

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const getCustomFieldsForGroup = (groupName: string): any[] => {
    const group = formData.customFields?.find((f: any) => f.group === groupName);
    return group?.fields || [];
  };

  const editProduct = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateProduct(formData.productId, updatedForm);
    if (res.success) router.push(`/inventory/product/productDetails/${formData.productId}`);
    setIsSubmitting(false);
  };

  return (
    <div className="edit-product-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      <form className="product-form space-y-6" onSubmit={editProduct}>
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Product Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Product ID</label>
              <Input id="productId" type="text" placeholder="e.g, PROD-2024-00001" value={formData.productId || ""} onChange={(e) => handleInputChange("productId", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Display Name</label>
              <Input id="displayName" type="text" placeholder="e.g, Product name 00012" value={formData.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Manufacturer Product ID</label>
              <Input id="manufacturerId" type="text" placeholder="e.g, SR-ETIR-012" value={formData.manufacturerProductId || ""} onChange={(e) => handleInputChange("manufacturerProductId", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Brand</label>
              <Input id="brand" type="text" placeholder="e.g, Brand of the product" value={formData.brand || ""} onChange={(e) => handleInputChange("brand", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Unit of Measure</label>
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.unitOfMeasure || ""} onChange={(e) => handleInputChange("unitOfMeasure", e.target.value)}>
                <option value="">Select unit</option>
                {["kilograms","kilowatt","piece","pack","pair","roll","gram","liter","meter"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Value</label>
              <Input id="value" type="text" placeholder="Enter value" value={formData.value || ""} onChange={(e) => handleInputChange("value", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Short Description</label>
              <textarea className="w-full border border-input rounded-md px-2.5 py-1 text-sm" id="shortDesc" rows={2} placeholder="A brief summary of the product" value={formData.shortDescription || ""} onChange={(e) => handleInputChange("shortDescription", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Long Description</label>
              <textarea className="w-full border border-input rounded-md px-2.5 py-1 text-sm" id="longDesc" rows={4} placeholder="Detailed product description, features, and benefits" value={formData.longDescription || ""} onChange={(e) => handleInputChange("longDescription", e.target.value)} />
            </div>
            {getCustomFieldsForGroup("Product Details").map((field: any, i: number) => (
              <div key={i}>
                <label className="text-sm font-medium mb-1 block">{field.label}</label>
                <Input id={field.id} type={field.type} placeholder={`Enter ${field.label?.toLowerCase()}`} value={field.value || ""} onChange={(e) => handleInputChange(field.id, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Allocation</label>
              <Input id="allocation" type="number" placeholder="200" value={formData.inventory.allocation || ""} onChange={(e) => handleInventoryChange("allocation", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">In-Stock Date</label>
              <Input id="instockDate" type="date" value={formatDateForInput(formData.inventory.inStockDate)} onChange={(e) => { const finalValue = new Date(e.target.value).toISOString(); setFormData((prev) => ({ ...prev, inventory: { ...prev.inventory, inStockDate: finalValue } })); setUpdatedForm((prev) => ({ ...prev, inventory: { ...prev.inventory, inStockDate: finalValue } })); }} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Backorder Quantity</label>
              <Input id="backorderQty" type="number" placeholder="50" value={formData.inventory.backorderQty || ""} onChange={(e) => handleInventoryChange("backorderQty", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preorder Quantity</label>
              <Input id="preorderQty" type="number" placeholder="100" value={formData.inventory.preOrderQty || ""} onChange={(e) => handleInventoryChange("preOrderQty", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Low Stock Threshold</label>
              <Input id="lowStockThreshold" type="text" placeholder="Enter minimum quantity for alert" value={formData.lowStockThreshold || ""} onChange={(e) => handleInputChange("lowStockThreshold", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Warehouse Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Warehouse Details</h3>
          {formData.warehouses?.map((warehouse: any, i: number) => (
            <div className="grid grid-cols-2 gap-4 mb-4" key={i}>
              <div>
                <label className="text-sm font-medium mb-1 block">Warehouse {i + 1} ID</label>
                <Input id="warehouseId" type="text" placeholder="e.g, WH-EAST-001" value={warehouse.warehouseId || ""} onChange={(e) => handleWarehouseChange("warehouseId", i, e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ATS (Available to Sell)</label>
                <Input id="ats" type="number" placeholder="0" value={warehouse.ats} onChange={(e) => handleWarehouseChange("ats", i, e.target.value)} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={handleAddWarehouse}>+ Add Warehouse</Button>
        </div>

        {/* Pricing Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Pricing Details</h3>
          {formData.pricingDetails?.map((entry: any, index: number) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Currency</label>
                  {formData.pricingDetails?.length > 1 && index > 0 && (
                    <button type="button" onClick={() => handleRemovePricingEntry(index)} className="text-red-500 text-sm">Remove</button>
                  )}
                </div>
                <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={entry.currency} onChange={(e) => handlePricingChange(index, "currency", e.target.value)}>
                  {["EUR","USD","INR","SAR","CAD"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div />
              <div>
                <label className="text-sm font-medium mb-1 block">Cut off Price</label>
                <Input type="text" placeholder="0.00" value={entry.cutOffPrice} onChange={(e) => handlePricingChange(index, "cutOffPrice", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Price</label>
                <Input type="text" placeholder="0.00" value={entry.price} onChange={(e) => handlePricingChange(index, "price", e.target.value)} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={handleAddCurrency}>+ Add Currency</Button>
        </div>

        {/* Custom Groups */}
        {newGroups.map((newGroup, i: number) => (
          <div key={i} className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
            <h3 className="text-lg font-semibold mb-4">{newGroup.group}</h3>
            <div className="grid grid-cols-2 gap-4">
              {newGroup.fields.map((field: any, j: number) => (
                <div key={j}>
                  <label className="text-sm font-medium mb-1 block">{field.label}</label>
                  <Input id={field.id} type={field.type} placeholder={`Enter ${field.label?.toLowerCase()}`} value={field.value || ""} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium">Enable Product</span>
              <input className="w-4 h-4" type="checkbox" checked={formData.enable || false} onChange={(e) => handleInputChange("enable", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium">Perpetual</span>
              <input className="w-4 h-4" type="checkbox" checked={formData.perpetual || false} onChange={(e) => handleInputChange("perpetual", e.target.checked)} />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
