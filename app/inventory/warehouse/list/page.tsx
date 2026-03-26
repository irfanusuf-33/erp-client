"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Warehouse {
  _id: string;
  name: string;
  city: string;
  state: string;
  unitNumber: string;
  warehouseId: string;
  enabled?: boolean;
}

export default function InventoryWarehouseList() {
  const router = useRouter();
  const { getAllWarehouses, searchWarehouses, toggleWarehouseStatus } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const loadWarehouses = async () => {
    setLoading(true);
    if (globalFilter) {
      // searchWarehouses returns { success, data: items[] }
      const result = await searchWarehouses(globalFilter);
      if (result.success) {
        const items = result.data || [];
        setWarehouses(items);
        setRowCount(items.length);
      } else {
        setWarehouses([]); setRowCount(0);
      }
    } else {
      // getAllWarehouses slice returns { success, data: res.data }
      // res.data (axios) = { success, data: { items[], totalItems, pages } }
      const result = await getAllWarehouses();
      if (result.success) {
        const items = result.data?.data?.items || [];
        setWarehouses(items);
        setRowCount(result.data?.data?.totalItems || items.length);
      } else {
        setWarehouses([]); setRowCount(0);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadWarehouses(); }, [globalFilter]);

  const handleToggleStatus = async () => {
    if (selected.length === 0) return;
    const selectedWhs = warehouses.filter((w) => selected.includes(w.warehouseId));
    const allDisabled = selectedWhs.every((w) => !w.enabled);
    const ids = selectedWhs.map((w) => w.warehouseId);
    const result = await toggleWarehouseStatus(ids);
    if (result.success) {
      setWarehouses((prev) => prev.map((w) => ids.includes(w.warehouseId) ? { ...w, enabled: allDisabled } : w));
    }
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === warehouses.length ? [] : warehouses.map((w) => w.warehouseId));

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Warehouse List</h2>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 gap-3">
          <Input
            type="text"
            placeholder="Search warehouses..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                {warehouses.filter((w) => selected.includes(w.warehouseId)).every((w) => !w.enabled) ? "Enable" : "Disable"}
              </Button>
            )}
            <Button size="sm" onClick={() => router.push("/inventory/warehouse/create")}>Add New Warehouse</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === warehouses.length && warehouses.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : warehouses.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No warehouses found</td></tr>
              ) : (
                warehouses.map((wh) => (
                  <tr key={wh.warehouseId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(wh.warehouseId)} onChange={() => toggleSelect(wh.warehouseId)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="cursor-pointer text-blue-600 underline" onClick={() => router.push(`/inventory/warehouse/warehouseDetail/${wh.warehouseId}`)}>
                        {wh.warehouseId}
                      </span>
                    </td>
                    <td className="px-4 py-3">{wh.name}</td>
                    <td className="px-4 py-3">{[wh.unitNumber, wh.city, wh.state].filter(Boolean).join(", ")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${wh.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {wh.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/warehouse/edit/${wh.warehouseId}`)}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
          {rowCount} total
        </div>
      </div>
    </div>
  );
}
