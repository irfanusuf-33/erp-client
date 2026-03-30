"use client";
import { Fragment, useState, useEffect, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronUp, ChevronDown, HelpCircle, ChevronRight } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RolesTable from "@/app/iam/components/blocks/RolesTable";
import IamUserRolesDashboard from "@/app/iam/components/blocks/IamUserRolesDashboard";
import IamGroups from "@/app/iam/groups/page";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function generatePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Step 1: User Details ──────────────────────────────────────────────────────
function StepUserDetails({ formData, setFormData, onNext }: { formData: any; setFormData: any; onNext: () => void }) {
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((p: any) => ({ ...p, [id]: value }));
    setErrors((p: any) => ({ ...p, [id]: undefined }));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchUser(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/hrm/employee/search?searchTerm=${value}`);
        setSearchResults(res.data?.data || res.data?.employees || []);
      } catch { setSearchResults([]); }
      setLoading(false);
    }, 500);
  };

  const handleSelectEmployee = (emp: any) => {
    setFormData((p: any) => ({ ...p, fName: emp.personalDetails?.firstName || "", lName: emp.personalDetails?.lastName || "", email: emp.contactDetails?.email || "" }));
    setSearchUser(""); setSearchResults([]); setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!formData.fName) errs.fName = "First name is required";
    if (!formData.lName) errs.lName = "Last name is required";
    if (!formData.email) errs.email = "Email is required";
    if (!formData.pwd) errs.pwd = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext();
  };

  return (
    <div className="px-6 py-12">
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="px-6 py-5">
            <h2 className="text-base font-medium text-gray-800">Set User Details</h2>
            <p className="mt-1 text-sm text-gray-500">*Required field</p>
          </div>
          <div className="p-6 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => setShowImport(!showImport)}>
                  Import User {showImport ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </div>
              {showImport && (
                <div className="relative">
                  <Input placeholder="Search Employee" value={searchUser} onChange={handleSearchChange} />
                  {loading && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full max-h-48 overflow-y-auto">
                      <ul>{searchResults.map((emp, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectEmployee(emp)}>
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(emp.personalDetails?.firstName?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{`${emp.personalDetails?.firstName || ""} ${emp.personalDetails?.lastName || ""}`.trim()}</div>
                            <div className="text-xs text-gray-500">{emp.contactDetails?.email}</div>
                          </div>
                        </li>
                      ))}</ul>
                    </div>
                  )}
                </div>
              )}
              {([["fName", "First Name", "text"], ["lName", "Last Name", "text"], ["email", "Email", "email"]] as [string, string, string][]).map(([id, label, type]) => (
                <div key={id}>
                  <label className="block text-sm font-medium mb-1">{label} <span className="text-red-500">*</span></label>
                  <Input type={type} id={id} aria-invalid={!!errors[id]} value={formData[id]} onChange={handleChange} />
                  {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
                </div>
              ))}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
                  <Input type={showPassword ? "text" : "password"} id="pwd" aria-invalid={!!errors.pwd} value={formData.pwd} onChange={handleChange} className="pr-10" />
                  <button type="button" className="absolute right-2 top-8 text-gray-400" onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {errors.pwd && <p className="text-red-500 text-xs mt-1">{errors.pwd}</p>}
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={() => setFormData((p: any) => ({ ...p, pwd: generatePassword() }))} className="bg-blue-600 hover:bg-blue-700 text-white">Generate</Button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" id="forceMfa" checked={formData.forceMfa || false} onChange={(e) => setFormData((p: any) => ({ ...p, forceMfa: e.target.checked }))} />
                Force MFA Login
              </label>
              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/iam/users")}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Attach Permissions ────────────────────────────────────────────────
function StepPermissions({ formData, setFormData, onBack, onNext }: { formData: any; setFormData: any; onBack: () => void; onNext: () => void }) {
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
        {["policies", "groups", "roles"].map((tab, i, arr) => (
          <Fragment key={tab}>
            <button onClick={() => setActiveTab(tab)} className="py-3 px-1 text-sm" style={{ textDecorationLine: "underline", textDecorationColor: activeTab === tab ? "#2563eb" : "transparent", textDecorationThickness: "2px", color: activeTab === tab ? "#2563eb" : "#111" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
            {i < arr.length - 1 && <span className="text-gray-400">|</span>}
          </Fragment>
        ))}
      </div>
      <div className="border border-gray-200 rounded-lg p-4 bg-white pb-12 min-h-[450px]">
        {activeTab === "policies" && <RolesTable selectedPermissions={formData.policies} onTogglePermission={handleTogglePermission} />}
        {activeTab === "groups" && <IamGroups selectionMode selectedGroups={formData.groups || []} onToggleGroup={handleToggleGroup} />}
        {activeTab === "roles" && <IamUserRolesDashboard selectedRoles={formData.roles || []} onToggleRole={handleToggleRole} selectionEnabled />}
        {error && <p className="text-red-500 text-center mt-2.5 text-sm">{error}</p>}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
          if (!formData.policies.length && !formData.roles?.length && !formData.groups?.length) { setError("At least one policy, role, or group must be assigned."); return; }
          setError(""); onNext();
        }}>Attach Permission</Button>
      </div>
    </div>
  );
}

// ── Step 3: Review & Create ───────────────────────────────────────────────────
function StepReview({ formData, onBack }: { formData: any; onBack: () => void }) {
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
              <TableContainer><Table>
                <TableHead><TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                </TableRow></TableHead>
                <TableBody>{policiesData.map((p: any) => (
                  <TableRow key={p.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{p.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{p.description}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table></TableContainer>
            ) : <p className="py-5 text-center text-gray-500 text-sm">No policies selected</p>
          )}

          {activeTab === "groups" && (
            groupsData.length > 0 ? (
              <TableContainer><Table>
                <TableHead><TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Group Name</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                </TableRow></TableHead>
                <TableBody>{groupsData.map((g: any) => (
                  <TableRow key={g.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{g.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{g.description}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table></TableContainer>
            ) : <p className="py-5 text-center text-gray-500 text-sm">No groups selected</p>
          )}

          {activeTab === "roles" && (
            rolesData.length > 0 ? (
              <TableContainer><Table>
                <TableHead><TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                </TableRow></TableHead>
                <TableBody>{rolesData.map((role: any) => (
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
                ))}</TableBody>
              </Table></TableContainer>
            ) : <p className="py-5 text-center text-gray-500 text-sm">No roles selected</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={submitForm} disabled={isPending}>{isPending ? "Creating..." : "Create"}</Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CreateUserPage() {
  const [view, setView] = useState(1);
  const [formData, setFormData] = useState({ fName: "", lName: "", email: "", username: "", pwd: "", forceMfa: false, policies: [] as string[], roles: [] as string[], groups: [] as string[] });

  return (
    <div>
      {view === 1 && <StepUserDetails formData={formData} setFormData={setFormData} onNext={() => setView(2)} />}
      {view === 2 && <StepPermissions formData={formData} setFormData={setFormData} onBack={() => setView(1)} onNext={() => setView(3)} />}
      {view === 3 && <StepReview formData={formData} onBack={() => setView(2)} />}
    </div>
  );
}
