"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, HelpCircle, ChevronRight, ChevronUp } from "lucide-react";
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
import { showSuccess, showError } from "@/lib/toast";

export default function IamReviewUser({ setView, formData }: IamStepProps) {
  const [isPending, setPending] = useState(false);
  const [activeTab, setActiveTab] = useState("policies");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { policies, groups, roles, fetchPolicies, fetchGroups, fetchRoles } = useGlobalStore();

  useEffect(() => {
    if (!policies.length) fetchPolicies();
    if (!groups.length) fetchGroups(1, 100);
    if (!roles.length) fetchRoles();
  }, []);

  const submitForm = async () => {
    setPending(true);
    try {
      const res = await axiosInstance.post("/iam/users/create", formData);
      if (res.data?.success) { showSuccess("User Created", "User has been created successfully."); router.push("/iam/users"); }
    } catch (e: any) { showError("Failed to Create User", e?.response?.data?.msg || "An error occurred"); }
    setPending(false);
  };

  const policiesData = formData.policies.map((policy: string) => {
    const found = policies.flatMap((cat) => cat.policies).find((p) => p.id === policy);
    return { name: policy, description: found?.description || "-" };
  });

  const groupsData = (formData.groups || []).map((g: string) => {
    const gd = groups.find((x) => x.groupName === g);
    return { name: g, description: gd?.groupDescription || "-" };
  });

  const rolesData = (formData.roles || []).map((role: string) => {
    const roleCategory = roles.flatMap((cat) => cat.policies).find((p) => p.id === role || p.name === role);
    return { name: role, policies: roleCategory?.description?.replace("Policies: ", "").split(", ").filter(Boolean) || [] };
  });

  const pwd = formData.pwd || "";

  return (
    <div className="px-6 py-9 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Review and Create</h2>
        <p className="text-sm text-gray-500 mt-1">Review your choices.</p>
      </div>
      <div className="flex flex-col gap-4">

        {/* User Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">User Details</h4>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  {["First Name", "Last Name", "Email", "Username", "Password", "Access Type"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ borderBottom: "1px solid #e5e7eb" }}>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.fName}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.lName}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.email}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.email?.split("@")[0]}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>
                    <div className="flex items-center gap-1">
                      {showPassword ? pwd : "•".repeat(pwd.length)}
                      <button type="button" className="ml-2 text-gray-500" onClick={() => setShowPassword((p) => !p)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>
                    <div className="flex items-center gap-1">
                      {formData.forceMfa ? "MFA Authentication Access" : "Standard Access"}
                      <HelpCircle size={12} className="text-gray-500" />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Permissions Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-lg font-semibold mb-4">Permissions Summary</h4>
          <div className="flex items-center gap-6 mb-5">
            {["policies", "groups", "roles"].map((tab, i, arr) => (
              <Fragment key={tab}>
                <button onClick={() => setActiveTab(tab)} className={`text-base ${activeTab === tab ? "text-blue-600 underline decoration-blue-600 decoration-2" : "text-gray-900 no-underline"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
                {i < arr.length - 1 && <span className="text-gray-400">|</span>}
              </Fragment>
            ))}
          </div>

          {activeTab === "policies" && (
            policiesData.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {policiesData.map((p: any) => (
                      <TableRow key={p.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{p.name}</TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{p.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <p className="py-5 text-center text-gray-500 text-sm">No policies selected</p>
          )}

          {activeTab === "groups" && (
            groupsData.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Group Name</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupsData.map((g: any) => (
                      <TableRow key={g.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{g.name}</TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{g.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <p className="py-5 text-center text-gray-500 text-sm">No groups selected</p>
          )}

          {activeTab === "roles" && (
            rolesData.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Role Name</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rolesData.map((role: any) => (
                      <Fragment key={role.name}>
                        <TableRow sx={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer", "&:hover": { backgroundColor: "#f9fafb" } }} onClick={() => setExpandedRole((p) => (p === role.name ? null : role.name))}>
                          <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>
                            <div className="flex items-center gap-1">
                              {expandedRole === role.name ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                              {role.name}
                            </div>
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{role.name} role permissions</TableCell>
                        </TableRow>
                        {expandedRole === role.name && role.policies.map((p: string) => (
                          <TableRow key={p} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                            <TableCell sx={{ pl: "3rem", fontSize: "0.875rem", color: "#6b7280" }}>{p}</TableCell>
                            <TableCell />
                          </TableRow>
                        ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <p className="py-5 text-center text-gray-500 text-sm">No roles selected</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setView(2)}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={submitForm} disabled={isPending}>{isPending ? "Creating..." : "Create"}</Button>
      </div>
    </div>
  );
}
