"use client";
import RolesTable from "./blocks/RolesTable";
import { Button } from "@/components/ui/button";

import type { IamStepWithSetProps } from "@/types/iam.types";

export default function IamGroupPermissions({ setView, formData, setFormData }: IamStepWithSetProps) {
  const handleTogglePermission = (id: string) => setFormData((p: any) => ({ ...p, policies: p.policies?.includes(id) ? p.policies.filter((x: string) => x !== id) : [...(p.policies || []), id] }));

  return (
    <div className="px-6 py-9">
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-800">Add Group Policies</p>
          <p className="text-sm text-gray-500">Assign policies to groups to control access.</p>
        </div>
        <RolesTable selectedPermissions={formData.policies || []} onTogglePermission={handleTogglePermission} />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setView(1)}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setView(3)}>Attach Permission</Button>
      </div>
    </div>
  );
}
