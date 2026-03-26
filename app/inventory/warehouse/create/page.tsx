"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryCreateWarehouse() {
  const router = useRouter();
  const { addWarehouse, searchUsersForInventory } = useGlobalStore();
  const [formData, setFormData] = useState({
    name: "", capacity: "", description: "", country: "", buildingNo: "",
    streetNumber: "", streetName: "", unitNumber: "", city: "", state: "", zipCode: "",
    operators: [{ name: "", email: "" }], enabled: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Warehouse Name is required";
    if (!formData.capacity) newErrors.capacity = "Capacity is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.city) newErrors.city = "City is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    const response = await addWarehouse(formData);
    if (response.success) router.push("/inventory/warehouse/list");
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleOperatorChange = (index: number, field: string, value: string) => {
    const updated = [...formData.operators];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, operators: updated }));
  };

  const handleSearchChange = (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    setTimeout(async () => {
      const nl = [...searchLoading]; nl[index] = true; setSearchLoading(nl);
      const res = await searchUsersForInventory(value);
      const nr = [...searchResults]; nr[index] = res.users || []; setSearchResults(nr);
      const nl2 = [...searchLoading]; nl2[index] = false; setSearchLoading(nl2);
    }, 500);
  };

  const handleSelectUser = (index: number, user: any) => {
    const fullName = `${user.fName || ""} ${user.lName || ""}`.trim() || "Unknown User";
    const updated = [...formData.operators]; updated[index] = { name: fullName, email: user.email };
    setFormData((prev) => ({ ...prev, operators: updated }));
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const newResults = [...searchResults]; newResults[index] = []; setSearchResults(newResults);
  };

  const addOperator = () => {
    setFormData((prev) => ({ ...prev, operators: [...prev.operators, { name: "", email: "" }] }));
    setSearchTerms((prev) => [...prev, ""]); setSearchResults((prev) => [...prev, []]); setSearchLoading((prev) => [...prev, false]);
  };

  const removeOperator = () => {
    if (formData.operators.length > 1) {
      setFormData((prev) => ({ ...prev, operators: prev.operators.slice(0, -1) }));
      setSearchTerms((prev) => prev.slice(0, -1)); setSearchResults((prev) => prev.slice(0, -1)); setSearchLoading((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="create-product-container p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Warehouse</h1>

      {/* Warehouse Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Warehouse Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Warehouse Name <span className="text-red-500">*</span></label>
            <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter your warehouse name" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Warehouse Capacity <span className="text-red-500">*</span></label>
            <Input value={formData.capacity} onChange={(e) => handleInputChange("capacity", e.target.value)} placeholder="Enter your warehouse capacity" />
            {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Warehouse Description <span className="text-red-500">*</span></label>
            <textarea className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={5} value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Description of the Warehouse" />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Address Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Country <span className="text-red-500">*</span></label>
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)}>
              <option value="">Select Country</option>
              {[["usa","United States"],["canada","Canada"],["uk","United Kingdom"],["germany","Germany"],["france","France"],["australia","Australia"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Building No. <span className="text-red-500">*</span></label>
            <Input value={formData.buildingNo} onChange={(e) => handleInputChange("buildingNo", e.target.value)} placeholder="Enter building no." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Street Number <span className="text-red-500">*</span></label>
            <Input value={formData.streetNumber} onChange={(e) => handleInputChange("streetNumber", e.target.value)} placeholder="001" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Street Name <span className="text-red-500">*</span></label>
            <Input value={formData.streetName} onChange={(e) => handleInputChange("streetName", e.target.value)} placeholder="Enter Street name" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Unit Number <span className="text-red-500">*</span></label>
            <Input value={formData.unitNumber} onChange={(e) => handleInputChange("unitNumber", e.target.value)} placeholder="Enter Unit Number" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">City <span className="text-red-500">*</span></label>
            <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} placeholder="Enter your city" />
            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">State <span className="text-red-500">*</span></label>
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)}>
              <option value="">Select State</option>
              {[["california","California"],["texas","Texas"],["florida","Florida"],["newyork","New York"],["illinois","Illinois"],["pennsylvania","Pennsylvania"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Zip/Postal Code <span className="text-red-500">*</span></label>
            <Input value={formData.zipCode} onChange={(e) => handleInputChange("zipCode", e.target.value)} placeholder="Enter zip code" />
          </div>
        </div>
      </div>

      {/* Operator Details */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Operator Details</h2>
        {formData.operators.map((operator, i) => (
          <div key={i} className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Operator {i + 1} - Name <span className="text-red-500">*</span></label>
                {formData.operators.length > 1 && <button type="button" onClick={removeOperator} className="text-gray-400 hover:text-red-500 text-sm">Remove</button>}
              </div>
              <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search Operator" value={formData.operators[i]?.name || searchTerms[i] || ""} onChange={(e) => handleSearchChange(i, e.target.value)} />
              {searchLoading[i] && <span className="absolute right-3 top-8 text-xs text-gray-400">...</span>}
              {searchResults[i]?.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults[i].map((user: any, userIdx: number) => {
                    const fullName = `${user.fName || ""} ${user.lName || ""}`.trim() || "Unknown User";
                    return (
                      <div key={userIdx} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => handleSelectUser(i, user)}>
                        <div className="font-medium">{fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email <span className="text-red-500">*</span></label>
              <Input value={formData.operators[i]?.email || ""} onChange={(e) => handleOperatorChange(i, "email", e.target.value)} placeholder="Enter your email" />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" type="button" onClick={addOperator}>+ Add Operator</Button>
      </div>

      {/* Warehouse Settings */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Warehouse Settings</h2>
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
