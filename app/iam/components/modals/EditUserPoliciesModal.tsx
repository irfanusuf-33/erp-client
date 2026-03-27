"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EditUserPoliciesModalProps, PolicyItem, PolicyGroup } from "@/types/iam.types";

export default function EditUserPoliciesModal({ isOpen, onClose, assignedPolicies, allPolicies, handler, loader }: EditUserPoliciesModalProps) {
  const [policyGroups, setPolicyGroups] = useState<PolicyGroup[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  useEffect(() => {
    if (assignedPolicies) {
      const extracted = assignedPolicies.flatMap((m) => m.policies?.map((p) => p.name) || []);
      setSelectedPolicies(extracted);
    }
  }, [assignedPolicies, allPolicies]);

  useEffect(() => {
    if (!allPolicies) return;
    setPolicyGroups((prev) => allPolicies.map((module: any) => {
      const existing = prev.find((g) => g.id === module.id);
      return {
        id: module.id, title: module.name, isExpanded: existing?.isExpanded || false,
        items: (module.policies || []).map((p: any) => ({ id: p.label, label: p.label, description: p.description, checked: selectedPolicies.includes(p.label) })),
      };
    }));
  }, [allPolicies, selectedPolicies]);

  const handleToggleGroup = (id: string) => setPolicyGroups((prev) => prev.map((g) => g.id === id ? { ...g, isExpanded: !g.isExpanded } : g));
  const handleToggleItem = (groupId: string, itemId: string) => {
    setSelectedPolicies((prev) => prev.includes(itemId) ? prev.filter((p) => p !== itemId) : [...prev, itemId]);
    setPolicyGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, items: g.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i) } : g));
  };

  const filteredGroups = policyGroups.map((g) => ({ ...g, items: g.items.filter((i) => i.label) })).filter((g) => g.items.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User Policies</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto flex flex-col gap-1">
          {filteredGroups.length > 0 ? filteredGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-md overflow-hidden">
              <button
                type="button"
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100"
                onClick={() => handleToggleGroup(group.id)}
                aria-expanded={group.isExpanded}
              >
                <span>{group.title}</span>
                {group.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {group.isExpanded && (
                <div className="flex flex-col">
                  {group.items.map((item) => (
                    <label key={item.id} className={`flex items-start gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${item.checked ? "bg-blue-50" : ""}`}>
                      <input type="checkbox" checked={item.checked} onChange={() => handleToggleItem(group.id, item.id)} className="mt-0.5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )) : <p className="text-sm text-gray-500 text-center py-4">No policies found.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handler(selectedPolicies)} disabled={loader}>{loader ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
