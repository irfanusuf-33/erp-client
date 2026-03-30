"use client";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import IamUserRolesDashboard from "../components/blocks/IamUserRolesDashboard";
import CreateRoleModal from "../components/modals/CreateRoleModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalStore } from "@/store";

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);

  const { fetchPolicies, fetchRoles } = useGlobalStore();

  useEffect(() => {
    fetchPolicies().then((transformed) => {
      if (!transformed) return;
      setPolicies(transformed.map((cat) => ({
        id: cat.id,
        name: cat.title,
        policies: cat.policies.map((p) => ({ id: p.id, label: p.name, description: p.description })),
      })));
    });
    fetchRoles();
  }, []);

  return (
    <div className="px-6 py-7">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          User Roles
          <div className="relative group flex items-center ml-2">
            <Info size={16} className="cursor-pointer text-gray-500" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
              <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
              <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">
                User roles define sets of permissions.
              </div>
            </div>
          </div>
        </h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search roles or permissions"
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" onClick={() => setShowCreateRoleModal(true)}>Create Custom Role</Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto min-h-[450px]">
        <IamUserRolesDashboard searchTerm={searchTerm} />
      </div>

      <CreateRoleModal
        isOpen={showCreateRoleModal}
        onClose={() => setShowCreateRoleModal(false)}
        allPolicies={policies}
        onCreated={() => setShowCreateRoleModal(false)}
      />
    </div>
  );
}
