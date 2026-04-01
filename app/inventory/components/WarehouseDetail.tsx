"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Edit2, Save, X, Plus } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/toast";

export default function WarehouseDetail() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const { getWarehouseDetail, updateWarehouse, searchUsersForInventory } = useGlobalStore();

  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[][]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([]);

  const load = async () => {
    if (!warehouseId) return;
    setLoading(true);
    const res = await getWarehouseDetail(warehouseId);
    if (res.success) { setWarehouse(res.data.data); setEdited(res.data.data); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [warehouseId]);

  const handleChange = (field: string, value: any) => setEdited((p: any) => ({ ...p, [field]: value }));

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
    const updated = [...(edited?.operators || [])]; updated[index] = { name: fullName, email: user.email };
    handleChange("operators", updated);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const r = [...searchResults]; r[index] = []; setSearchResults(r);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, warehouseId: wid, updatedAt, ...updateData } = edited;
      const res = await updateWarehouse(warehouse.warehouseId, updateData);
      if (res.success) {
        showSuccess("Warehouse Updated", "Warehouse updated successfully.");
        setWarehouse(edited); setIsEditing(false);
      }
    } catch {
      showError("Update Failed", "Failed to update warehouse");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;
  if (!warehouse) return <div className="p-12 text-center text-gray-500">Warehouse not found</div>;

  const Field = ({ label, value, editNode }: { label: string; value: any; editNode?: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{label}</p>
      {isEditing && editNode ? editNode : <p className="text-sm font-normal text-gray-800 dark:text-zinc-100">{value || "N/A"}</p>}
    </div>
  );

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Warehouse Details</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl px-9 pt-9 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Warehouse Details</h2>
          {!isEditing ? (
            <button className="text-blue-600 hover:text-blue-700 mr-8" onClick={() => setIsEditing(true)}><Edit2 size={18} /></button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEdited(warehouse); }}><X size={14} className="mr-1" />Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}><Save size={14} className="mr-1" />{saving ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </div>

        {/* Name & Capacity */}
        <div className="flex gap-[300px] mt-6 flex-wrap">
          <Field label="Warehouse Name" value={warehouse.name} editNode={<InputField value={edited?.name || ""} onChange={(e) => handleChange("name", e.target.value)} />} />
          <Field label="Warehouse Capacity" value={warehouse.capacity} editNode={<InputField value={edited?.capacity || ""} onChange={(e) => handleChange("capacity", e.target.value)} />} />
        </div>

        {/* Description */}
        <div className="mt-10 flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Long Description</p>
          {isEditing ? <TextArea rows={4} value={edited?.description || ""} onChange={(e) => handleChange("description", e.target.value)} /> : <p className="text-sm text-gray-800 dark:text-zinc-100">{warehouse.description}</p>}
        </div>

        {/* Address */}
        <div className="mt-14">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Address Details</h3>
          <div className="flex gap-[19%] flex-wrap row-gap-10">
            {[
              [["Country", "country"], ["City", "city"]],
              [["Building No", "buildingNo"], ["State", "state"]],
              [["Street Number", "streetNumber"], ["Street Name", "streetName"]],
              [["Zip/Postal Code", "zipCode"], ["Unit Details", "unitNumber"]],
            ].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-10">
                {col.map(([label, field]) => (
                  <Field key={field} label={label} value={(warehouse as any)[field]} editNode={<InputField value={(edited as any)?.[field] || ""} onChange={(e) => handleChange(field, e.target.value)} />} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Operators */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">Operator Details</h3>
            {isEditing && <Button variant="outline" size="sm" onClick={() => handleChange("operators", [...(edited?.operators || []), { name: "", email: "" }])}><Plus size={14} className="mr-1" />Add Operator</Button>}
          </div>
          {(isEditing ? edited?.operators : warehouse.operators)?.map((op: any, i: number) => (
            <div key={i} className="w-1/2 flex gap-[30%] mt-6">
              <div className="flex flex-col w-1/4">
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Operator {i + 1}</p>
                {isEditing ? (
                  <div className="relative mt-2">
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
                    {(edited?.operators?.length || 0) > 1 && <button className="absolute -right-6 top-2 text-red-500 hover:text-red-700" onClick={() => handleChange("operators", edited.operators.filter((_: any, j: number) => j !== i))}><X size={14} /></button>}
                  </div>
                ) : <p className="text-sm mt-2 text-gray-800 dark:text-zinc-100">{op.name}</p>}
              </div>
              <div className="flex flex-col w-1/4">
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Email Address</p>
                {isEditing ? <InputField className="mt-2" value={op.email} onChange={(e) => { const updated = [...edited.operators]; updated[i] = { ...updated[i], email: e.target.value }; handleChange("operators", updated); }} /> : <p className="text-sm mt-2 text-gray-800 dark:text-zinc-100">{op.email}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-sm font-semibold text-gray-500 dark:text-zinc-400">Updated by {warehouse.updatedBy || "Unknown"}</div>
      </div>
    </div>
  );
}
