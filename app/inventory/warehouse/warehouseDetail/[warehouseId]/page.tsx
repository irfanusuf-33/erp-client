"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InventoryWarehouseDetail() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const router = useRouter();
  const { getWarehouseDetail, updateWarehouse, searchUsersForInventory } = useGlobalStore();
  const [warehouseDetail, setWarehouseDetail] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWarehouse, setEditedWarehouse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[][]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([]);

  useEffect(() => {
    if (warehouseId) {
      getWarehouseDetail(warehouseId).then((res) => {
        if (res.success) {
          // slice: { success, data: res.data }
          // res.data (axios) = { success, data: warehouseObject }
          const warehouse = res.data?.data || res.data;
          setWarehouseDetail(warehouse);
          setEditedWarehouse(warehouse);
        }
      });
    }
  }, [warehouseId]);

  const handleChange = (field: string, value: any) =>
    setEditedWarehouse((prev: any) => ({ ...prev, [field]: value }));

  const handleOperatorChange = (index: number, field: string, value: string) => {
    const updated = [...(editedWarehouse?.operators || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("operators", updated);
  };

  const handleOperatorSearch = (index: number, value: string) => {
    const newTerms = [...searchTerms]; newTerms[index] = value; setSearchTerms(newTerms);
    if (!value.trim()) { const r = [...searchResults]; r[index] = []; setSearchResults(r); return; }
    setTimeout(async () => {
      const nl = [...searchLoading]; nl[index] = true; setSearchLoading(nl);
      const res = await searchUsersForInventory(value);
      const nr = [...searchResults]; nr[index] = res.users || []; setSearchResults(nr);
      const nl2 = [...searchLoading]; nl2[index] = false; setSearchLoading(nl2);
    }, 500);
  };

  const handleSelectOperator = (index: number, user: any) => {
    const fullName = `${user.fName || ""} ${user.lName || ""}`.trim() || "Unknown User";
    const updated = [...(editedWarehouse?.operators || [])];
    updated[index] = { name: fullName, email: user.email };
    handleChange("operators", updated);
    const newTerms = [...searchTerms]; newTerms[index] = ""; setSearchTerms(newTerms);
    const newResults = [...searchResults]; newResults[index] = []; setSearchResults(newResults);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const { _id, warehouseId: wId, updatedAt, ...updateData } = editedWarehouse;
    const result = await updateWarehouse(warehouseDetail.warehouseId, updateData);
    if (result.success) { setWarehouseDetail(editedWarehouse); setIsEditing(false); }
    setIsSubmitting(false);
  };

  if (!warehouseDetail) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/warehouse/list")}>← Back</Button>
        <h1 className="text-2xl font-bold">Warehouse Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Warehouse Details</h1>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditedWarehouse(warehouseDetail); }}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </div>

        {/* Name & Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Warehouse Name</p>
            {isEditing ? <Input value={editedWarehouse?.name || ""} onChange={(e) => handleChange("name", e.target.value)} /> : <p className="font-medium">{warehouseDetail.name}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Warehouse Capacity</p>
            {isEditing ? <Input value={editedWarehouse?.capacity || ""} onChange={(e) => handleChange("capacity", e.target.value)} /> : <p className="font-medium">{warehouseDetail.capacity}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Description</p>
          {isEditing ? <textarea rows={4} className="w-full border border-input rounded-md px-2.5 py-1 text-sm" value={editedWarehouse?.description || ""} onChange={(e) => handleChange("description", e.target.value)} /> : <p>{warehouseDetail.description || "—"}</p>}
        </div>

        {/* Address Details */}
        <div>
          <h2 className="text-base font-semibold mb-3">Address Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["Country","country"],["City","city"],["Building No","buildingNo"],["State","state"],["Street Number","streetNumber"],["Street Name","streetName"],["Zip/Postal Code","zipCode"],["Unit Number","unitNumber"]].map(([label, field]) => (
              <div key={field}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                {isEditing ? <Input value={editedWarehouse?.[field] || ""} onChange={(e) => handleChange(field, e.target.value)} /> : <p className="font-medium">{warehouseDetail[field] || "—"}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Operator Details */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Operator Details</h2>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={() => {
                handleChange("operators", [...(editedWarehouse?.operators || []), { name: "", email: "" }]);
                setSearchTerms((p) => [...p, ""]); setSearchResults((p) => [...p, []]); setSearchLoading((p) => [...p, false]);
              }}>Add Operator</Button>
            )}
          </div>
          {(isEditing ? editedWarehouse?.operators : warehouseDetail.operators)?.map((operator: any, index: number) => (
            <div key={index} className="mb-4 border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">Operator {index + 1}</p>
                {isEditing && (editedWarehouse?.operators?.length || 0) > 1 && (
                  <button type="button" onClick={() => handleChange("operators", editedWarehouse?.operators?.filter((_: any, i: number) => i !== index))} className="text-red-500 text-sm">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  {isEditing ? (
                    <>
                      <input className="h-9 w-full rounded-md border border-input px-2.5 py-1 text-sm" type="text" placeholder="Search Operator" value={operator.name || searchTerms[index] || ""} onChange={(e) => handleOperatorSearch(index, e.target.value)} />
                      {searchResults[index]?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {searchResults[index].map((user: any, userIdx: number) => (
                            <div key={userIdx} className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm" onClick={() => handleSelectOperator(index, user)}>
                              <div className="font-medium">{`${user.fName || ""} ${user.lName || ""}`.trim()}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : <p className="font-medium">{operator.name}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  {isEditing ? <Input value={operator.email} onChange={(e) => handleOperatorChange(index, "email", e.target.value)} placeholder="Operator email" /> : <p className="font-medium">{operator.email}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">Warehouse ID: {warehouseDetail.warehouseId}</p>
          <Button variant="link" size="sm" onClick={() => router.push(`/inventory/warehouse/edit/${warehouseDetail.warehouseId}`)}>Edit in full page</Button>
        </div>
      </div>
    </div>
  );
}
