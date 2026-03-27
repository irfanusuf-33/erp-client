"use client";
import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddUserToGroupModalProps } from "@/types/iam.types";

export default function AddUserToGroupModal({ isOpen, onClose, groupId, onUserAdded }: AddUserToGroupModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (term = searchTerm) => {
    const trimmed = term.trim();
    setFoundUsers([]);
    if (!trimmed) return;
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/iam/users/search`, { params: { search: trimmed } });
      const users = res.data?.users || [];
      setFoundUsers(users.filter((u: any) => !selectedUsers.some((s) => s._id === u._id)));
    } catch {}
    setIsSearching(false);
  };

  const toggleSelect = (user: any) => {
    setSelectedUsers((prev) => prev.some((u) => u._id === user._id) ? prev.filter((u) => u._id !== user._id) : [...prev, user]);
    setFoundUsers((prev) => prev.filter((u) => u._id !== user._id));
  };

  const combinedUsers = searchTerm.trim() === "" ? selectedUsers : [...selectedUsers, ...foundUsers.filter((f) => !selectedUsers.some((s) => s._id === f._id))];

  const handleAddUsers = async () => {
    if (!selectedUsers.length) return;
    setError("");
    const users = selectedUsers.map((u) => u.email);
    try {
      const res = await axiosInstance.post("/iam/groups/assign", { form: { groupId: String(groupId), users } });
      if (res.data?.success) { onUserAdded?.(users); onClose(); setSelectedUsers([]); setSearchTerm(""); }
      else setError(res.data?.msg || "Failed to add users");
    } catch (e: any) {
      setError(e?.response?.data?.msg || "Failed to add users");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Group</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); handleSearch(e.target.value); }}
          />
          <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
            {!isSearching && searchTerm.trim() === "" && combinedUsers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Search by email to add users to the group</p>
            )}
            {!isSearching && searchTerm.trim() !== "" && foundUsers.length === 0 && selectedUsers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No users found</p>
            )}
            {combinedUsers.map((user) => (
              <div
                key={user._id}
                className={`flex flex-col px-3 py-2 rounded-md cursor-pointer border transition-colors ${selectedUsers.some((s) => s._id === user._id) ? "bg-blue-50 border-blue-300" : "border-gray-200 hover:bg-gray-50"}`}
                onClick={() => toggleSelect(user)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleSelect(user); }}
              >
                <span className="text-sm font-medium">{user.fName} {user.lName}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          {error && <p className="text-red-500 text-sm flex-1">{error}</p>}
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddUsers} disabled={!selectedUsers.length}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
