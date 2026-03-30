"use client";
import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoreVertical, Send, Plus, Minus, Trash2, Edit, Check, X, FileText, Info } from "lucide-react";
import { useGlobalStore } from "@/store";
import { createPortal } from "react-dom";
import AddUserToGroupModal from "./modals/AddUserToGroupModal";
import EditGroupSingleModal from "./modals/EditGroupSingleModal";
import EditUserPoliciesModal from "./modals/EditUserPoliciesModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BaseTable from "@/components/ui/table/BaseTable";
import type { MRT_ColumnDef } from "material-react-table";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function IamGroupDetails() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const { getGroupDetails, removeUsersFromGroup, toggleGroupStatus, updateGroup, removeGroupPolicies, fetchPolicies, policies: storePolicies } = useGlobalStore();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState<any>(null);
  const [isEditPoliciesModalOpen, setIsEditPoliciesModalOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loader, setLoader] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState<any>({});
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [editedFiles, setEditedFiles] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);

  const userData = (group?.users || []).map((email: string) => ({ email, username: email.split("@")[0] }));

  function PoliciesCell({ policies }: { policies: string[] }) {
    const [open, setOpen] = useState(false);
    if (!policies?.length) return <span className="text-gray-400">None</span>;
    const visible = policies.slice(0, 3);
    const extra = policies.length - 3;
    return (
      <>
        <div className="flex flex-wrap gap-1 items-center">
          {visible.map((p) => <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{p}</span>)}
          {extra > 0 && (
            <button onClick={() => setOpen(true)} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">+{extra} more</button>
          )}
        </div>
        {open && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl w-96" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <h3 className="text-sm font-semibold text-gray-800">All Policies</h3>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="overflow-y-auto max-h-80 px-6 pb-5">
                <div className="flex flex-wrap gap-2">
                  {policies.map((p) => <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{p}</span>)}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  const fetchGroup = async () => {
    if (!groupId) return;
    setLoading(true);
    const res = await getGroupDetails(groupId);
    if (res?.group) setGroup(res.group);
    else if (res) setGroup(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroup();
    const load = async () => {
      const transformed = storePolicies.length ? storePolicies : await fetchPolicies();
      if (!transformed) return;
      setPolicies(transformed.map((cat) => ({ id: cat.id, name: cat.title, policies: cat.policies.map((p) => ({ id: p.id, label: p.name, description: p.description })) })));
    };
    load();
  }, [groupId]);

  const getModuleFullName = (name: string) => ({ iam: "Identity Access Management", inventory: "Inventory", accounts: "Accounts Management", crm: "Customer Relationship Management", root: "System Administration", ticketing: "Ticketing", calendar: "Calendar", sales: "Sales" }[name.toLowerCase()] || name);

  const handleRemove = async (emails: string[]) => {
    const res = await removeUsersFromGroup(groupId!, group._id, emails);
    if (res?.success) setGroup({ ...group, users: group.users?.filter((u: string) => !emails.includes(u)) });
  };

  const handledisable = async () => {
    const res = await toggleGroupStatus([group._id]);
    if (res?.success) setGroup({ ...group, disabled: !group.disabled });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedGroup({ name: group.name, description: group.description });
    setSelectedPolicies(group.policies?.flatMap((pg: any) => pg.policies?.map((p: any) => p.name) || []) || []);
    setEditedFiles(group.files || []); setNewFiles([]);
    setDropdownOpen(false);
  };

  const handleSaveEdit = async () => {
    setLoader(true);
    try {
      const filesToRemove = (group.files || []).filter((f: any) => !editedFiles.some((ef: any) => ef.url === f.url)).map((f: any) => f.url);
      const res = await updateGroup(group._id, { name: editedGroup.name ?? group.name, description: editedGroup.description ?? group.description, policies: selectedPolicies, filesToRemove, rawFiles: newFiles.length ? newFiles : undefined });
      if (res?.success || res?.status === 200) {
        setIsEditing(false); setEditedGroup({}); setEditedFiles([]); setNewFiles([]);
        if (editedGroup.name !== group.name) { setGroup({ ...group, name: editedGroup.name, description: editedGroup.description }); router.replace(`/iam/groups/${editedGroup.name}`); }
        else fetchGroup();
      }
    } catch {}
    setLoader(false);
  };

  const setNewPoliciesToGroup = async (selected: string[]) => {
    setLoader(true);
    try { await removeGroupPolicies(groupId!, selected, group.name); setIsEditPoliciesModalOpen(false); fetchGroup(); } catch {}
    setLoader(false);
  };

  if (loading || !group) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const filesColumns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "name", header: "File Name",
      Cell: ({ row }: { row: any }) => (
        <a href={row.original.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
          <FileText size={18} />{row.original.name}{row.original.isNew ? " (New)" : ""}
        </a>
      ),
    },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "size", header: "Size", Cell: ({ row }: { row: any }) => <span>{`${(row.original.size / 1024).toFixed(2)} KB`}</span> },
    ...(isEditing ? [{
      id: "action", header: "Action",
      Cell: ({ row }: any) => (
        <button onClick={() => row.original.isNew ? setNewFiles(newFiles.filter((_, j) => j !== row.original._newIdx)) : setEditedFiles(editedFiles.filter((_, j) => j !== row.index))} className="text-red-500 hover:text-red-700">
          <Trash2 size={18} />
        </button>
      ),
    }] as MRT_ColumnDef<any>[] : []),
  ];

  const filesData = [
    ...(isEditing ? editedFiles : group.files || []).map((f: any, i: number) => ({ ...f, index: i })),
    ...(isEditing ? newFiles.map((f, i) => ({ name: f.name, type: f.type, size: f.size, isNew: true, _newIdx: i })) : []),
  ];

  const groupPolicyNames: string[] = (group.policies || []).flatMap((pg: any) => pg.policies?.map((p: any) => p.label || p.name) || []);

  const usersColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: "username", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      id: "assignedPolicies", header: "Assigned Policies",
      Cell: () => <PoliciesCell policies={groupPolicyNames} />,
    },
    {
      id: "actions", header: "Actions",
      Cell: ({ row }: any) => (
        <button className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemove([row.original.email])}>
          <Trash2 size={14} />Remove
        </button>
      ),
    },
  ];

  return (
    <div className="p-9 bg-gray-50 min-h-screen">
<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-9">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 pl-4 flex items-center">
            Group Details
            <div className="relative group flex items-center ml-2">
              <Info size={16} className="cursor-pointer text-gray-500" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
                <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
                <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">View and manage the details of this group including name, description and code.</div>
              </div>
            </div>
          </h1>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm"><MoreVertical size={20} className="text-gray-600" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}><Edit size={14} />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { handledisable(); setDropdownOpen(false); }}><Trash2 size={14} />Disable</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col gap-2 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Group Name</span>
            {isEditing ? <Input value={editedGroup.name ?? group.name} onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })} /> : <span className="text-sm text-gray-800">{group.name}</span>}
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Created By</span>
            <span className="text-sm text-gray-800">{group.createdBy || "-"}</span>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Group code</span>
            <span className="text-sm text-gray-800">{group.code || "-"}</span>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-lg col-span-3">
            <span className="text-sm font-medium text-gray-500">Description</span>
            {isEditing ? <Input value={editedGroup.description ?? group.description} onChange={(e) => setEditedGroup({ ...editedGroup, description: e.target.value })} /> : <span className="text-sm text-gray-800">{group.description || "-"}</span>}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-2 mb-9">
          <Button variant="outline" onClick={() => { setIsEditing(false); setEditedGroup({}); setEditedFiles([]); setNewFiles([]); }}><X size={16} />Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveEdit} disabled={loader}>{loader ? <span className="text-xs">Saving...</span> : <><Check size={16} />Save</>}</Button>
        </div>
      )}

      <div className="mt-9 rounded-lg bg-white shadow-sm p-8 mb-9">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold flex items-center">
            Users
            <div className="relative group flex items-center ml-2">
              <Info size={16} className="cursor-pointer text-gray-500" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
                <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
                <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">All users currently assigned to this group. You can add or remove users here.</div>
              </div>
            </div>
          </h2>
          <div className="flex gap-2">
            <Button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddUserModalOpen(true)}><Plus size={16} />Add User to Group</Button>
            <Button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push(`/iam/send-bulk-email?groupId=${group._id}`)}><Send size={16} />Send Bulk Email</Button>
          </div>
        </div>
        <BaseTable data={userData} columns={usersColumns} />
      </div>

      <div className="mt-9 rounded-lg bg-white shadow-sm p-8 mb-9">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold flex items-center">
            Assigned Policies
            <div className="relative group flex items-center ml-2">
              <Info size={16} className="cursor-pointer text-gray-500" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
                <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
                <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">Policies assigned to this group. All users in the group inherit these permissions.</div>
              </div>
            </div>
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm"><MoreVertical size={20} className="text-gray-600" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditPoliciesModalOpen(true)}><Edit size={14} />Update Policies</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }} />
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>Module Name</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", width:"60%" }}>Policies</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!(group.policies || []).length ? (
                  <TableRow><TableCell colSpan={3} sx={{ fontSize: "0.875rem", color: "#6b7280" }}>No policies assigned</TableCell></TableRow>
                ) : (group.policies || []).map((pg: any, i: number) => (
                  <Fragment key={pg.module || pg.name || i}>
                    <TableRow
                      sx={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer", backgroundColor: expandedModule === String(i) ? "#eff6ff" : "inherit", "&:hover": { backgroundColor: expandedModule === String(i) ? "#eff6ff" : "#f9fafb" } }}
                      onClick={() => setExpandedModule((p) => (p === String(i) ? null : String(i)))}
                    >
                      <TableCell sx={{ width: 32, verticalAlign: "middle", height: 48 }}>{expandedModule === String(i) ? <Minus size={16} /> : <Plus size={16} />}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937", verticalAlign: "middle", height: 48 }}>{getModuleFullName(pg.module || pg.name || "")}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280", verticalAlign: "middle", height: 48 }}>{pg.policies?.length ?? 0} policies</TableCell>
                    </TableRow>
                    {expandedModule === String(i) && (pg.policies || []).map((policy: any) => (
                      <TableRow key={policy.label || policy.name} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                        <TableCell />
                        <TableCell sx={{ py: "0.75rem", pl: "3rem", fontSize: "0.875rem", color: "#1f2937" }}>{policy.label || policy.name}</TableCell>
                        <TableCell sx={{ py: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>{policy.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <div className="mt-9 rounded-lg bg-white shadow-sm p-8 mb-9">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold flex items-center">
            AI Training Files
            <div className="relative group flex items-center ml-2">
              <Info size={16} className="cursor-pointer text-gray-500" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
                <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
                <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">Files uploaded to train the AI model for this group's context and permissions.</div>
              </div>
            </div>
          </h2>
          <Button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => document.getElementById("file-upload-input")?.click()}><Plus size={16} />Add New Training File</Button>
        </div>
        {filesData.length > 0 ? (
          <BaseTable data={filesData} columns={filesColumns} />
        ) : (
          <div className="py-5 text-center text-gray-500 text-sm">No AI training files uploaded for this group.</div>
        )}
        <input type="file" multiple onChange={(e) => { if (e.target.files) setNewFiles([...newFiles, ...Array.from(e.target.files)]); }} className="hidden" id="file-upload-input" />
      </div>

      <AddUserToGroupModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} groupId={group._id || ""} onUserAdded={(users) => setGroup({ ...group, users: [...(group.users || []), ...users] })} />
      <EditGroupSingleModal isOpen={isEditGroupModalOpen} onClose={() => setIsEditGroupModalOpen(false)} onNext={() => { setIsEditGroupModalOpen(false); fetchGroup(); }} groupData={editGroupData} setGroupData={setEditGroupData} />
      <EditUserPoliciesModal isOpen={isEditPoliciesModalOpen} onClose={() => setIsEditPoliciesModalOpen(false)} assignedPolicies={group.policies || []} allPolicies={policies} loader={loader} handler={setNewPoliciesToGroup} />
    </div>
  );
}
