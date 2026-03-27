"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, HelpCircle, ChevronRight, ChevronUp } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import type { IamStepProps } from "@/types/iam.types";

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
      if (res.data?.success) router.push("/iam/users");
    } catch {}
    setPending(false);
  };

  const userDetailsColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: "fName", header: "First Name" },
    { accessorKey: "lName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "username", header: "Username" },
    {
      accessorKey: "pwd",
      header: "Password",
      Cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {showPassword ? row.original.pwd : "•".repeat(row.original.pwd.length)}
          <button type="button" className="ml-2 text-gray-500" onClick={() => setShowPassword((p) => !p)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      ),
    },
    {
      accessorKey: "forceMfa",
      header: "Access Type",
      Cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.forceMfa ? "MFA Authentication Access" : "Standard Access"}
          <HelpCircle size={12} className="text-gray-500" />
        </div>
      ),
    },
  ];

  const policiesColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: "name", header: "Policy Name" },
    { accessorKey: "description", header: "Description" },
  ];

  const groupsColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: "name", header: "Group Name" },
    { accessorKey: "description", header: "Description" },
  ];

  const rolesColumns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      Cell: ({ row }) => (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setExpandedRole((p) => (p === row.original.name ? null : row.original.name))}>
          {expandedRole === row.original.name ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ row }) =>
        expandedRole === row.original.name ? (
          <div className="flex flex-col gap-1">
            {row.original.policies.map((p: string) => (
              <div key={p} className="pl-4 text-sm text-gray-600">{p}</div>
            ))}
          </div>
        ) : (
          <span>{row.original.name} role permissions</span>
        ),
    },
  ];

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

  return (
    <div className="px-6 py-9 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Review and Create</h2>
        <p className="text-sm text-gray-500 mt-1">Review your choices.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">User Details</h4>
          <BaseTable
            data={[{ fName: formData.fName, lName: formData.lName, email: formData.email, username: formData.email.split("@")[0], pwd: formData.pwd, forceMfa: formData.forceMfa }]}
            columns={userDetailsColumns}
          />
        </div>

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
            policiesData.length > 0
              ? <BaseTable data={policiesData} columns={policiesColumns} />
              : <p className="py-5 text-center text-gray-500 text-sm">No policies selected</p>
          )}
          {activeTab === "groups" && (
            groupsData.length > 0
              ? <BaseTable data={groupsData} columns={groupsColumns} />
              : <p className="py-5 text-center text-gray-500 text-sm">No groups selected</p>
          )}
          {activeTab === "roles" && (
            rolesData.length > 0
              ? <BaseTable data={rolesData} columns={rolesColumns} />
              : <p className="py-5 text-center text-gray-500 text-sm">No roles selected</p>
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
