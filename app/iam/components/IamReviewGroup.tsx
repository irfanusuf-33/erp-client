"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronUp } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import type { IamStepProps } from "@/types/iam.types";

export default function IamReviewGroup({ setView, formData }: IamStepProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPolicyGroups, setSelectedPolicyGroups] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { policies, fetchPolicies } = useGlobalStore();

  const getModuleFullName = (name: string) => ({ iam: "Identity Access Management", inventory: "Inventory", accounts: "Accounts Management", crm: "Customer Relationship Management", root: "System Administration", ticketing: "Ticketing", calendar: "Calendar", sales: "Sales" }[name.toLowerCase()] || name);

  useEffect(() => {
    const load = async () => {
      const transformed = policies.length ? policies : await fetchPolicies();
      if (!transformed) return;
      const selected = new Set(formData.policies || []);
      const groups: any[] = [];
      for (const cat of transformed) {
        const matched = cat.policies.filter((p) => selected.has(p.id)).map((p) => ({ name: p.id, description: p.description || "-" }));
        if (matched.length) groups.push({ moduleKey: cat.id, moduleName: getModuleFullName(cat.id), policies: matched });
      }
      setSelectedPolicyGroups(groups);
    };
    load();
  }, [formData.policies]);

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("admin", formData.admin);
      payload.append("code", formData.code);
      payload.append("description", formData.description);
      if (formData.policies?.length) payload.append("policies", JSON.stringify(formData.policies));
      (formData.rawFiles || []).forEach((f: File) => payload.append("file", f));
      const res = await axiosInstance.post("/iam/groups/create", payload, { headers: { "Content-Type": "multipart/form-data" } });
      if (!res.data?.success) { setError(res.data?.msg || "Failed to create group"); setLoading(false); return; }
      router.push("/iam/groups");
    } catch (e: any) { setError(e?.response?.data?.msg || "Failed to create group"); }
    setLoading(false);
  };

  const detailsColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: "name", header: "Group Name" },
    { accessorKey: "admin", header: "Group Admin" },
    { accessorKey: "code", header: "Group Code" },
    { accessorKey: "description", header: "Description" },
  ];

  const filesColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: "name", header: "File Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "size", header: "Size (MB)" },
  ];

  const policiesColumns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "moduleName",
      header: "Policy Name",
      Cell: ({ row }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setExpandedModules((p) => ({ ...p, [row.original.moduleKey]: !p[row.original.moduleKey] }))}
        >
          {expandedModules[row.original.moduleKey] ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
          {row.original.moduleName}
        </div>
      ),
    },
    {
      accessorKey: "policies",
      header: "Permissions",
      Cell: ({ row }) =>
        expandedModules[row.original.moduleKey] ? (
          <div className="flex flex-col gap-1">
            {row.original.policies.map((p: any) => (
              <div key={p.name} className="pl-4 text-sm text-gray-600">{p.name} — {p.description}</div>
            ))}
          </div>
        ) : <span />,
    },
  ];

  return (
    <div className="px-6 py-9 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Review and Create</h2>
        <p className="text-sm text-gray-500 mt-1">Review your choices.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">Group Details</h4>
          <BaseTable
            data={[{ name: formData.name, admin: formData.adminName || formData.admin, code: formData.code, description: formData.description }]}
            columns={detailsColumns}
          />
        </div>

        {formData.files?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-base font-medium mb-4 ml-3">AI Training Files</h4>
            <BaseTable data={formData.files} columns={filesColumns} />
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">Permissions Summary</h4>
          {selectedPolicyGroups.length > 0 ? (
            <BaseTable data={selectedPolicyGroups} columns={policiesColumns} />
          ) : (
            <p className="py-5 text-center text-gray-500 text-sm">No policies assigned</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {error && <p className="text-red-500 text-sm flex items-center">{error}</p>}
        <Button variant="outline" onClick={() => setView(2)}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={loading}>{loading ? "Creating..." : "Create Group"}</Button>
      </div>
    </div>
  );
}
