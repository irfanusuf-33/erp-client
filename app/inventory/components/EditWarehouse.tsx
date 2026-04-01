"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Select from "@/components/ui/form/Select";
import { showSuccess, showError } from "@/lib/toast";

export default function EditWarehouse() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const router = useRouter();
  const { getWarehouseDetail, updateWarehouse, searchUsersForInventory } = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);

  useEffect(() => {
    if (!warehouseId) return;
    (async () => {
      const res = await getWarehouseDetail(warehouseId);
      if (res.success) setFormData(res.data.data);
      setLoading(false);
    })();
  }, [warehouseId]);

  const handleChange = (field: string, value: any) =>
    setFormData((p: any) => ({ ...p, [field]: value }));

  const handleOperatorSearch = async (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    const newLoad = [...searchLoading]; newLoad[index] = true; setSearchLoading(newLoad);
    try {
      const res = await searchUsersForInventory(value);
      const r = [...searchResults]; r[index] = res.success ? res.users || [] : []; setSearchResults(r);
    } finally { const l = [...searchLoading]; l[index] = false; setSearchLoading(l); }
  };

  const handleSelectOperator = (index: number, user: any) => {
    const fullName = `${user.fName || ""} ${user.lName || ""}`.trim() || "Unknown";
    const updated = [...(formData?.operators || [])]; updated[index] = { name: fullName, email: user.email };
    handleChange("operators", updated);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const r = [...searchResults]; r[index] = []; setSearchResults(r);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, warehouseId: wid, updatedAt, ...updateData } = formData;
      const res = await updateWarehouse(wid, updateData);
      if (res.success) {
        showSuccess("Warehouse Updated", "Warehouse updated successfully.");
        router.push("/inventory/warehouse/list");
      }
    } catch {
      showError("Error", "Failed to update warehouse");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;
  if (!formData) return <div className="p-12 text-center text-gray-500">Warehouse not found</div>;

  const countryOptions = [
    { value: "usa", label: "United States" }, { value: "canada", label: "Canada" },
    { value: "uk", label: "United Kingdom" }, { value: "germany", label: "Germany" },
    { value: "france", label: "France" }, { value: "australia", label: "Australia" },
  ];
  const stateOptions = [
    { value: "california", label: "California" }, { value: "texas", label: "Texas" },
    { value: "florida", label: "Florida" }, { value: "newyork", label: "New York" },
    { value: "illinois", label: "Illinois" }, { value: "pennsylvania", label: "Pennsylvania" },
  ];

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 pl-2 mb-5">Edit Warehouse</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl px-9 pt-10 pb-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 pb-6">Warehouse Details</h2>

        <div className="grid grid-cols-2 gap-8">
          <InputField label="Warehouse Name" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter warehouse name" />
          <InputField label="Warehouse Capacity" value={formData.capacity || ""} onChange={(e) => handleChange("capacity", e.target.value)} placeholder="Enter capacity" />
        </div>

        <div className="mt-6">
          <TextArea label="Description" rows={5} value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} placeholder="Description of the Warehouse" />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mt-10 pb-6">Address Details</h2>
        <div className="grid grid-cols-2 gap-8">
          <Select label="Country" options={countryOptions} placeholder="Select Country" defaultValue={formData.country || ""} onChange={(v) => handleChange("country", v)} />
          <InputField label="Building No." value={formData.buildingNo || ""} onChange={(e) => handleChange("buildingNo", e.target.value)} placeholder="Enter building no." />
          <InputField label="Street Number" value={formData.streetNumber || ""} onChange={(e) => handleChange("streetNumber", e.target.value)} placeholder="001" />
          <InputField label="Street Name" value={formData.streetName || ""} onChange={(e) => handleChange("streetName", e.target.value)} placeholder="Enter street name" />
          <InputField label="Unit Number" value={formData.unitNumber || ""} onChange={(e) => handleChange("unitNumber", e.target.value)} placeholder="Enter unit number" />
          <InputField label="City" value={formData.city || ""} onChange={(e) => handleChange("city", e.target.value)} placeholder="Enter city" />
          <Select label="State" options={stateOptions} placeholder="Select State" defaultValue={formData.state || ""} onChange={(v) => handleChange("state", v)} />
          <InputField label="Zip/Postal Code" value={formData.zipCode || ""} onChange={(e) => handleChange("zipCode", e.target.value)} placeholder="Enter zip code" />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mt-10 pb-4">Operator Details</h2>
        {(formData.operators || []).map((op: any, i: number) => (
          <div key={i} className="grid grid-cols-2 gap-8 mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Operator {i + 1} - Name</label>
                {(formData.operators?.length || 0) > 1 && <button className="text-red-500 hover:text-red-700" onClick={() => handleChange("operators", formData.operators.filter((_: any, j: number) => j !== i))}><X size={16} /></button>}
              </div>
              <div className="relative">
                <Input placeholder="Search Operator" value={op.name || searchTerms[i] || ""} onChange={(e) => handleOperatorSearch(i, e.target.value)} />
                {searchLoading[i] && <span className="absolute right-3 top-2.5 text-xs text-gray-400">...</span>}
                {searchResults[i]?.length > 0 && (
                  <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                    {searchResults[i].map((user: any, j: number) => (
                      <div key={j} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => handleSelectOperator(i, user)}>
                        <div className="font-medium">{`${user.fName || ""} ${user.lName || ""}`.trim()}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <InputField label="Email" value={op.email || ""} onChange={(e) => { const updated = [...formData.operators]; updated[i] = { ...updated[i], email: e.target.value }; handleChange("operators", updated); }} placeholder="Enter email" />
          </div>
        ))}
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2" onClick={() => { handleChange("operators", [...(formData.operators || []), { name: "", email: "" }]); setSearchTerms((p) => [...p, ""]); setSearchResults((p) => [...p, []]); setSearchLoading((p) => [...p, false]); }}>
          <Plus size={16} />Add Operator
        </button>

        <div className="mt-10 mb-14">
          <label className="flex items-center gap-4 cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Enable Warehouse</h3>
            <input type="checkbox" className="appearance-none w-7 h-3.5 rounded-full bg-gray-300 relative cursor-pointer transition-colors checked:bg-amber-400 after:content-[''] after:absolute after:top-1/2 after:left-0.5 after:w-2.5 after:h-2.5 after:rounded-full after:bg-white after:-translate-y-1/2 after:transition-all checked:after:translate-x-3.5" checked={formData.enabled || false} onChange={(e) => handleChange("enabled", e.target.checked)} />
          </label>
        </div>

        <div className="flex justify-end gap-6 w-60 ml-auto">
          <Button variant="outline" onClick={() => router.push("/inventory/warehouse/list")}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Update"}</Button>
        </div>
      </div>
    </div>
  );
}
