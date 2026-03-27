"use client";
import { Fragment, useState } from "react";
import RolesTable from "./blocks/RolesTable";
import IamUserRolesDashboard from "./blocks/IamUserRolesDashboard";
import IamGroups from "./IamGroups";
import { Button } from "@/components/ui/button";
import type { IamStepWithSetProps } from "@/types/iam.types";

export default function IamUserPermissions({ setView, formData, setFormData }: IamStepWithSetProps) {
  const [activeTab, setActiveTab] = useState("policies");
  const [error, setError] = useState("");

  const handleTogglePermission = (id: string) => setFormData((p: any) => ({ ...p, policies: p.policies.includes(id) ? p.policies.filter((x: string) => x !== id) : [...p.policies, id] }));
  const handleToggleRole = (id: string) => setFormData((p: any) => { const r = p.roles || []; return { ...p, roles: r.includes(id) ? r.filter((x: string) => x !== id) : [...r, id] }; });
  const handleToggleGroup = (name: string) => setFormData((p: any) => { const g = p.groups || []; return { ...p, groups: g.includes(name) ? g.filter((x: string) => x !== name) : [...g, name] }; });

  return (
    <div className="px-6 py-9">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-lg font-bold text-gray-800">Attach Permissions</p>
          <p className="text-sm text-gray-500">Attach permissions to users to control access.</p>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-5">
        {["policies","groups","roles"].map((tab, i, arr) => (
          <Fragment key={tab}>
            <button onClick={() => setActiveTab(tab)} className="py-3 px-1 text-sm" style={{ textDecorationLine: "underline", textDecorationColor: activeTab === tab ? "#2563eb" : "transparent", textDecorationThickness: "2px", color: activeTab === tab ? "#2563eb" : "#111" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
            {i < arr.length - 1 && <span className="text-gray-400">|</span>}
          </Fragment>
        ))}
      </div>
      <div className="border border-gray-200 rounded-lg p-4 bg-white pb-12">
        {activeTab === "policies" && <RolesTable selectedPermissions={formData.policies} onTogglePermission={handleTogglePermission} />}
        {activeTab === "groups" && <IamGroups selectionMode selectedGroups={formData.groups || []} onToggleGroup={handleToggleGroup} />}
        {activeTab === "roles" && <IamUserRolesDashboard selectedRoles={formData.roles || []} onToggleRole={handleToggleRole} selectionEnabled />}
        {error && <p className="text-red-500 text-center mt-2.5 text-sm">{error}</p>}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setView(1)}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
          if (!formData.policies.length && !formData.roles?.length && !formData.groups?.length) { setError("At least one policy, role, or group must be assigned."); return; }
          setError(""); setView(3);
        }}>Attach Permission</Button>
      </div>
    </div>
  );
}
