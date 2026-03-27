"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateRoleModalProps } from "@/types/iam.types";

export default function CreateRoleModal({ isOpen, onClose, onCreated, allPolicies }: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [policyGroups, setPolicyGroups] = useState<any[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (!allPolicies) return;
    setPolicyGroups(allPolicies.map((m: any) => ({ id: m.id, title: m.name, isExpanded: false, items: (m.policies || []).map((p: any) => ({ id: p.label, label: p.label, description: p.description, checked: false })) })));
    setSelectedPolicies([]);
  }, [allPolicies, isOpen]);

  const toggleGroup = (id: string) => setPolicyGroups((prev) => prev.map((g) => g.id === id ? { ...g, isExpanded: !g.isExpanded } : g));
  const toggleItem = (groupId: string, itemId: string) => {
    setPolicyGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, items: g.items.map((i: any) => i.id === itemId ? { ...i, checked: !i.checked } : i) } : g));
    setSelectedPolicies((prev) => prev.includes(itemId) ? prev.filter((p) => p !== itemId) : [...prev, itemId]);
  };

  const handleCreate = async () => {
    if (!roleName.trim() || !selectedPolicies.length) return;
    setLoader(true);
    try {
      const res = await axiosInstance.post("/iam/roles", { roles: { name: roleName.trim(), policyIds: selectedPolicies } });
      onCreated?.({ name: roleName.trim(), policies: selectedPolicies, ...res.data });
      onClose();
    } catch {}
    setLoader(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input placeholder="Role Name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          <div className="max-h-96 overflow-y-auto flex flex-col gap-1">
            {policyGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.title}</span>
                  {group.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {group.isExpanded && (
                  <div className="flex flex-col">
                    {group.items.map((item: any) => (
                      <label key={item.id} className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${item.checked ? "bg-blue-50" : ""}`}>
                        <input type="checkbox" checked={item.checked} onChange={() => toggleItem(group.id, item.id)} />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate} disabled={loader}>{loader ? "Creating..." : "Create Role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
