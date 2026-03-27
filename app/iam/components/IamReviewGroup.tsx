"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronUp } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

  return (
    <div className="px-6 py-9 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Review and Create</h2>
        <p className="text-sm text-gray-500 mt-1">Review your choices.</p>
      </div>
      <div className="flex flex-col gap-4">

        {/* Group Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">Group Details</h4>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  {["Group Name", "Group Admin", "Group Code", "Description"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ borderBottom: "1px solid #e5e7eb" }}>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.name}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.adminName || formData.admin}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.code}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.description}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* AI Training Files */}
        {formData.files?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-base font-medium mb-4 ml-3">AI Training Files</h4>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    {["File Name", "Type", "Size (MB)"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.files.map((f: any) => (
                    <TableRow key={f.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{f.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{f.type}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{f.size}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* Permissions Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">Permissions Summary</h4>
          {selectedPolicyGroups.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Permissions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPolicyGroups.map((group: any) => (
                    <Fragment key={group.moduleKey}>
                      <TableRow sx={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer", "&:hover": { backgroundColor: "#f9fafb" } }} onClick={() => setExpandedModules((p) => ({ ...p, [group.moduleKey]: !p[group.moduleKey] }))}>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>
                          <div className="flex items-center gap-1">
                            {expandedModules[group.moduleKey] ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                            {group.moduleName}
                          </div>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
                      </TableRow>
                      {expandedModules[group.moduleKey] && group.policies.map((p: any) => (
                        <TableRow key={p.name} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                          <TableCell sx={{ pl: "3rem", fontSize: "0.875rem", color: "#6b7280" }}>{p.name}</TableCell>
                          <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{p.description}</TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
