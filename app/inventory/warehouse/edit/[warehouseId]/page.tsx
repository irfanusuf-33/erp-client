"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryWarehouseEdit() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const router = useRouter();
  const { getWarehouseDetail, updateWarehouse } = useGlobalStore();
  const [formData, setFormData] = useState<any>({ _id: "", zipCode: "", warehouseId: "", updatedAt: "", unitNumber: "", streetNumber: "", streetName: "", state: "", operators: [], name: "", enabled: true, description: "", country: "", city: "", capacity: "", buildingNo: "" });
  const [updatedData, setUpdatedData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (warehouseId) {
      getWarehouseDetail(warehouseId).then((res) => {
        // slice: { success, data: res.data }
        // res.data (axios) = { success, data: warehouseObject }
        if (res.success) setFormData(res.data?.data || res.data);
      });
    }
  }, [warehouseId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    const response = await updateWarehouse(warehouseId!, updatedData);
    if (response.success) router.push("/inventory/warehouse/list");
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setUpdatedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOperatorChange = (index: number, field: string, value: string) => {
    const updated = [...formData.operators]; updated[index] = { ...updated[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, operators: updated }));
    setUpdatedData((prev) => ({ ...prev, operators: updated }));
  };

  const addOperator = () => {
    const updated = [...formData.operators, { name: "", email: "" }];
    setFormData((prev: any) => ({ ...prev, operators: updated }));
    setUpdatedData((prev) => ({ ...prev, operators: updated }));
  };

  const removeOperator = (i: number) => {
    if (formData.operators.length > 1) {
      const updated = formData.operators.filter((_: any, idx: number) => idx !== i);
      setFormData((prev: any) => ({ ...prev, operators: updated }));
      setUpdatedData((prev) => ({ ...prev, operators: updated }));
    }
  };

  return (
    <div className="create-warehouse-main-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Warehouse</h1>

      {/* Warehouse Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Warehouse Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Warehouse Name</label>
            <Input placeholder="Enter your warehouse name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Warehouse Capacity</label>
            <Input placeholder="Enter your warehouse capacity" value={formData.capacity} onChange={(e) => handleInputChange("capacity", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium mb-1 block">Warehouse Description</label>
          <textarea rows={5} className="w-full border border-input rounded-md px-2.5 py-1 text-sm" placeholder="Description of the Warehouse" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} />
        </div>
      </div>

      {/* Address Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Address Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Country</label>
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)}>
              <option value="">Select Country</option>
              {[["usa","United States"],["canada","Canada"],["uk","United Kingdom"],["germany","Germany"],["france","France"],["australia","Australia"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Building No.</label>
            <Input placeholder="Enter building no." value={formData.buildingNo} onChange={(e) => handleInputChange("buildingNo", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Street Number</label>
            <Input placeholder="001" value={formData.streetNumber} onChange={(e) => handleInputChange("streetNumber", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Street Name</label>
            <Input placeholder="Enter Street name" value={formData.streetName} onChange={(e) => handleInputChange("streetName", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Unit Number</label>
            <Input placeholder="Enter Unit Number" value={formData.unitNumber} onChange={(e) => handleInputChange("unitNumber", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">City</label>
            <Input placeholder="Enter your city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">State</label>
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)}>
              <option value="">Select State</option>
              {[["california","California"],["texas","Texas"],["florida","Florida"],["newyork","New York"],["illinois","Illinois"],["pennsylvania","Pennsylvania"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Zip/Postal Code</label>
            <Input placeholder="Enter zip code" value={formData.zipCode} onChange={(e) => handleInputChange("zipCode", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Operator Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Operator Details</h2>
        {formData.operators.map((operator: any, i: number) => (
          <div key={i} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Operator {i + 1}</span>
              {formData.operators.length > 1 && <button type="button" onClick={() => removeOperator(i)} className="text-gray-400 hover:text-red-500 text-sm">Remove</button>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input placeholder="Search Operator" value={formData.operators[i]?.name || ""} onChange={(e) => handleOperatorChange(i, "name", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input placeholder="Enter your email" value={formData.operators[i]?.email || ""} onChange={(e) => handleOperatorChange(i, "email", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" type="button" onClick={addOperator}>+ Add Operator</Button>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-medium">Enable Warehouse</span>
          <input className="w-4 h-4" type="checkbox" checked={formData.enabled} onChange={(e) => handleInputChange("enabled", e.target.checked)} />
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => router.push("/inventory/warehouse/list")}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </div>
    </div>
  );
}
