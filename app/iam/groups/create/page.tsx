"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Plus, Trash2, FileText, ChevronRight, ChevronUp } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// ── Step 1: Group Details ──────────────────────────────────────────────────────
function StepDetails({ setView, formData, setFormData }: any) {
  const [errors, setErrors] = useState<any>({});
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useGlobalStore();
  const maxSize = 25 * 1024 * 1024;

  useEffect(() => {
    if (user?._id) setFormData((p: any) => p.admin === user._id ? p : { ...p, admin: user._id, adminName: user.username || user.email });
  }, [user]);

  useEffect(() => {
    setFormData((p: any) => ({
      ...p,
      rawFiles: uploadedDocs.length ? uploadedDocs : undefined,
      files: uploadedDocs.length ? uploadedDocs.map((f) => ({ url: "", size: (f.size / (1024 * 1024)).toFixed(2), name: f.name, type: f.type })) : undefined,
    }));
  }, [uploadedDocs]);

  const addFiles = (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    const valid = pdfs.filter((f) => f.size <= maxSize);
    if (pdfs.length - valid.length > 0) setUploadError(`${pdfs.length - valid.length} file(s) exceed 25 MB.`);
    else setUploadError("");
    setUploadedDocs((p) => { const merged = [...p, ...valid]; return merged.filter((f, i, s) => s.findIndex((x) => x.name === f.name && x.size === f.size) === i); });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!formData.name) errs.name = "Group name is required";
    if (!formData.code) errs.code = "Group code is required";
    if (!formData.description) errs.description = "Description is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setView(2);
  };

  return (
    <div className="px-6 py-9">
      <h1 className="text-xl font-semibold mb-4 ml-[72px]">Create Group</h1>
      <div className="mx-[72px] rounded-2xl border border-gray-200 bg-white">
        <div className="px-6 py-5">
          <h2 className="text-base font-medium text-gray-800">Set Group Details</h2>
          <p className="mt-1 text-sm text-gray-500">*Required field</p>
        </div>
        <div className="p-6 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              {([["name", "Group Name"], ["code", "Group Code"]] as [string, string][]).map(([id, label]) => (
                <div key={id}>
                  <label className="block text-sm font-medium mb-1">{label} <span className="text-red-500">*</span></label>
                  <Input id={id} value={formData[id]} onChange={(e) => { setFormData((p: any) => ({ ...p, [id]: e.target.value })); setErrors((p: any) => ({ ...p, [id]: undefined })); }} />
                  {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Group Admin</label>
                <Input className="bg-gray-50" value={formData.adminName || formData.admin} disabled />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
              <textarea rows={4} className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`} value={formData.description} onChange={(e) => { setFormData((p: any) => ({ ...p, description: e.target.value })); setErrors((p: any) => ({ ...p, description: undefined })); }} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-base font-medium text-gray-800 mb-2.5">
                  AI Knowledge Base
                  <div className="relative group flex items-center">
                    <Info size={14} className="text-gray-500 cursor-pointer" />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
                      <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
                      <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">Upload PDF documents to power the AI knowledge base for this group.</div>
                    </div>
                  </div>
                </div>
                <div
                  className={`min-h-[150px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
                  <p className="text-base font-medium text-gray-800">Click to Upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-0.5">PDF only, maximum file size 25 MB</p>
                </div>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
              </div>
              <div>
                <p className="text-base font-medium text-gray-800 mb-2.5">Uploaded Docs</p>
                {uploadedDocs.length === 0 ? (
                  <div className="min-h-[150px] border border-gray-200 rounded-lg flex items-center justify-center"><p className="text-base text-gray-500 font-medium">No Docs Uploaded</p></div>
                ) : (
                  <div className="min-h-[150px] max-h-[220px] overflow-y-auto border border-gray-200 rounded-lg p-2.5">
                    {uploadedDocs.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center gap-2.5 p-2 border-b last:border-0">
                        <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0"><FileText size={14} /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm text-gray-800 truncate">{file.name}</p><p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p></div>
                        <button type="button" className="text-red-500 hover:text-red-600 p-1 rounded" onClick={() => setUploadedDocs((p) => p.filter((f) => !(f.name === file.name && f.size === file.size)))}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/iam/groups")}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Permissions ────────────────────────────────────────────────────────
function StepPermissions({ setView, formData, setFormData }: any) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const { policies: storePolicies, fetchPolicies } = useGlobalStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storePolicies.length) { setLoading(true); fetchPolicies().finally(() => setLoading(false)); }
  }, []);

  const policies = storePolicies.map((cat) => ({ id: cat.id, name: cat.id, policies: cat.policies.map((p) => ({ id: p.id, label: p.id, description: p.description })) }));

  const toggle = (id: string) => setFormData((p: any) => ({ ...p, policies: p.policies?.includes(id) ? p.policies.filter((x: string) => x !== id) : [...(p.policies || []), id] }));

  return (
    <div className="px-6 py-9">
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-800">Add Group Policies</p>
          <p className="text-sm text-gray-500">Assign policies to groups to control access.</p>
        </div>
        <TableContainer sx={{ minHeight: 400 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policies Name</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} sx={{ textAlign: "center", py: 6 }}><span className="text-sm text-gray-400 animate-pulse">Loading...</span></TableCell></TableRow>
                : policies.map((role) => (
                  <Fragment key={role.id}>
                    <TableRow sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: expandedRole === role.id ? "#eff6ff" : "inherit", "&:hover": { backgroundColor: expandedRole === role.id ? "#eff6ff" : "#f9fafb" } }}>
                      <TableCell sx={{ width: 32 }}>
                        <input type="checkbox" checked={role.policies.every((p) => (formData.policies || []).includes(p.label))}
                          onChange={(e) => { e.stopPropagation(); const all = role.policies.every((p) => (formData.policies || []).includes(p.label)); role.policies.forEach((p) => { if (all && (formData.policies || []).includes(p.label)) toggle(p.label); else if (!all && !(formData.policies || []).includes(p.label)) toggle(p.label); }); }} />
                      </TableCell>
                      <TableCell sx={{ width: 32, cursor: "pointer" }} onClick={() => setExpandedRole((p) => (p === role.id ? null : role.id))}>
                        {expandedRole === role.id ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{role.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
                    </TableRow>
                    {expandedRole === role.id && role.policies.map((perm) => (
                      <TableRow key={perm.id} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#faf9f6" }}>
                        <TableCell /><TableCell />
                        <TableCell sx={{ py: "0.5rem", pl: "3rem", fontSize: "0.875rem" }}>
                          <div className="flex items-center gap-2"><input type="checkbox" checked={(formData.policies || []).includes(perm.label)} onChange={() => toggle(perm.label)} />{perm.label}</div>
                        </TableCell>
                        <TableCell sx={{ py: "0.5rem", px: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>{perm.description}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setView(1)}>Back</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setView(3)}>Attach Permission</Button>
      </div>
    </div>
  );
}

// ── Step 3: Review & Create ────────────────────────────────────────────────────
function StepReview({ setView, formData }: any) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPolicyGroups, setSelectedPolicyGroups] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { policies, fetchPolicies } = useGlobalStore();

  const MODULE_NAMES: Record<string, string> = { iam: "Identity Access Management", inventory: "Inventory", accounts: "Accounts Management", crm: "Customer Relationship Management", root: "System Administration", ticketing: "Ticketing", calendar: "Calendar", sales: "Sales" };

  useEffect(() => {
    const load = async () => {
      const t = policies.length ? policies : await fetchPolicies();
      if (!t) return;
      const selected = new Set(formData.policies || []);
      const groups: any[] = [];
      for (const cat of t) {
        const matched = cat.policies.filter((p) => selected.has(p.id)).map((p) => ({ name: p.id, description: p.description || "-" }));
        if (matched.length) groups.push({ moduleKey: cat.id, moduleName: MODULE_NAMES[cat.id] || cat.id, policies: matched });
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
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">Group Details</h4>
          <TableContainer><Table>
            <TableHead><TableRow sx={{ backgroundColor: "#f9fafb" }}>
              {["Group Name", "Group Admin", "Group Code", "Description"].map((h) => <TableCell key={h} sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>{h}</TableCell>)}
            </TableRow></TableHead>
            <TableBody><TableRow sx={{ borderBottom: "1px solid #e5e7eb" }}>
              <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.name}</TableCell>
              <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.adminName || formData.admin}</TableCell>
              <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.code}</TableCell>
              <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{formData.description}</TableCell>
            </TableRow></TableBody>
          </Table></TableContainer>
        </div>

        {formData.files?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-base font-medium mb-4 ml-3">AI Training Files</h4>
            <TableContainer><Table>
              <TableHead><TableRow sx={{ backgroundColor: "#f9fafb" }}>
                {["File Name", "Type", "Size (MB)"].map((h) => <TableCell key={h} sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>{h}</TableCell>)}
              </TableRow></TableHead>
              <TableBody>{formData.files.map((f: any) => (
                <TableRow key={f.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{f.name}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{f.type}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{f.size}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table></TableContainer>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h4 className="text-base font-medium mb-4 ml-3">Permissions Summary</h4>
          {selectedPolicyGroups.length > 0 ? (
            <TableContainer><Table>
              <TableHead><TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Permissions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {selectedPolicyGroups.map((group: any) => (
                  <Fragment key={group.moduleKey}>
                    <TableRow sx={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer", "&:hover": { backgroundColor: "#f9fafb" } }} onClick={() => setExpandedModules((p) => ({ ...p, [group.moduleKey]: !p[group.moduleKey] }))}>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>
                        <div className="flex items-center gap-1">{expandedModules[group.moduleKey] ? <ChevronUp size={16} /> : <ChevronRight size={16} />}{group.moduleName}</div>
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
            </Table></TableContainer>
          ) : <p className="py-5 text-center text-gray-500 text-sm">No policies assigned</p>}
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CreateGroupPage() {
  const [view, setView] = useState(1);
  const [formData, setFormData] = useState({ name: "", admin: "", code: "", description: "", policies: [] as string[], adminName: "", files: undefined as any, rawFiles: undefined as any });

  return (
    <div>
      {view === 1 && <StepDetails setView={setView} formData={formData} setFormData={setFormData} />}
      {view === 2 && <StepPermissions setView={setView} formData={formData} setFormData={setFormData} />}
      {view === 3 && <StepReview setView={setView} formData={formData} />}
    </div>
  );
}
