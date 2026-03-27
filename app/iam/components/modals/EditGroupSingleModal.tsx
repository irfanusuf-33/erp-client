"use client";
import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditGroupModalProps } from "@/types/iam.types";

export default function EditGroupSingleModal({ isOpen, onClose, onNext, groupData, setGroupData }: EditGroupModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!groupData) return;
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", groupData.name);
      payload.append("description", groupData.description);
      const res = await axiosInstance.put(`/iam/group/${groupData._id}`, payload);
      if (res.data?.success || res.status === 200) onNext();
    } catch {}
    setLoading(false);
  };

  return (
    <Dialog open={isOpen && !!groupData} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group Description</DialogTitle>
        </DialogHeader>
        {groupData && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Group Name</label>
              <Input value={groupData.name} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-red-500">You cannot change group name here.</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ring resize-none"
                rows={3}
                value={groupData.description}
                onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpdate} disabled={loading}>{loading ? "Updating..." : "Update"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
