"use client";
import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, MoreVertical, Edit, ChevronRight, ChevronUp } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const roleDescriptions: Record<string, string> = {
  admin: "Full system access with all permissions",
  employee: "Basic access for regular employees",
  manager: "Enhanced access for team management",
  hr: "Human resources management access",
  finance: "Financial operations and reporting access",
};

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const { fetchUserDetails, updateUserDetails, disableUser, enableUser, fetchPolicies, fetchGroups } = useGlobalStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>({});
  const [activeTab, setActiveTab] = useState("policies");
  const [policies, setPolicies] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUserDetails(userId).then((res: any) => { setUser(res?.user || res); setLoading(false); });
    fetchPolicies().then((transformed) => {
      if (!transformed) return;
      setPolicies(transformed.map((cat) => ({ id: cat.id, name: cat.title, policies: cat.policies.map((p) => ({ id: p.id, label: p.name, description: p.description })) })));
    });
    fetchGroups(1, 1000).then((res: any) => { setAllGroups(res?.data?.groups || res?.groups || []); });
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true); setDropdownOpen(false);
    try {
      const res = user.disabled ? await enableUser(user._id) : await disableUser(user._id);
      if (res?.success) setUser((p: any) => ({ ...p, disabled: !p.disabled }));
    } catch {}
    setActionLoading(false);
  };

  const handleEditUser = () => {
    setIsEditing(true);
    setEditedUser({ fName: user?.fName, lName: user?.lName, email: user?.email, username: user?.username, disabled: user?.disabled, policies: user?.policies || [], groups: (user?.groups || []).map((g: any) => g.name || g), roles: user?.roles || [] });
    setDropdownOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updateData: any = {};
      if (editedUser.fName !== user.fName) updateData.fName = editedUser.fName;
      if (editedUser.lName !== user.lName) updateData.lName = editedUser.lName;
      if (editedUser.email !== user.email) updateData.email = editedUser.email;
      if (JSON.stringify(editedUser.policies) !== JSON.stringify(user.policies || [])) updateData.policies = editedUser.policies;
      if (JSON.stringify(editedUser.groups) !== JSON.stringify((user.groups || []).map((g: any) => g.name || g))) updateData.groups = editedUser.groups;
      if (JSON.stringify(editedUser.roles) !== JSON.stringify(user.roles || [])) updateData.roles = editedUser.roles;
      await updateUserDetails(user._id, updateData);
      setUser({ ...user, ...editedUser }); setIsEditing(false); setEditedUser({});
    } catch {}
    setActionLoading(false);
  };

  const togglePolicy = (name: string) => setEditedUser((p: any) => ({ ...p, policies: p.policies.includes(name) ? p.policies.filter((x: string) => x !== name) : [...p.policies, name] }));
  const toggleGroup = (name: string) => setEditedUser((p: any) => ({ ...p, groups: (p.groups || []).includes(name) ? p.groups.filter((x: string) => x !== name) : [...(p.groups || []), name] }));
  const toggleRole = (name: string) => setEditedUser((p: any) => ({ ...p, roles: (p.roles || []).includes(name) ? p.roles.filter((x: string) => x !== name) : [...(p.roles || []), name] }));

  if (loading || !user) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const fields = [["First Name", "fName"], ["Last Name", "lName"], ["Email", "email"], ["Username", "username"]];

  const viewPoliciesData = (user.policies || []).map((p: string) => {
    const details = policies.flatMap((g) => g.policies).find((x: any) => x.label === p);
    return { name: p, description: details?.description || "-" };
  });

  const viewRolesData = (user.roles || []).map((r: string) => ({ name: r, description: roleDescriptions[r] || "-" }));
  const editRolesData = Object.keys(roleDescriptions).map((name) => ({ name, description: roleDescriptions[name] }));

  return (
    <div className="p-9 bg-gray-50 min-h-screen flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">User Details</h1>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm"><MoreVertical size={20} className="text-gray-600" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditUser}><Edit size={14} />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus} disabled={actionLoading}>
                {actionLoading ? <span className="text-xs">Loading...</span> : user.disabled
                  ? <><CheckCircle size={14} className="text-green-600" />Enable User</>
                  : <><XCircle size={14} className="text-red-500" />Disable User</>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-5 gap-4 p-6">
          {fields.map(([label, key]) => (
            <div key={key} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-blue-600">{label}</span>
              {isEditing ? <Input type="text" value={editedUser[key] ?? user[key]} onChange={(e) => setEditedUser((p: any) => ({ ...p, [key]: e.target.value }))} /> : <span className="text-sm text-gray-800">{user[key] || "-"}</span>}
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-blue-600">Status</span>
            <div className="text-sm">
              {user.disabled
                ? <div className="flex items-center gap-1.5"><XCircle size={16} className="text-red-600" /><span className="text-red-600">Disabled</span></div>
                : <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-700" /><span className="text-green-700">Active</span></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Permissions Summary</h2>
        <div className="flex items-center gap-6 border-b-2 border-gray-200 mb-5">
          {["policies", "groups", "roles"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 -mb-0.5 transition-colors ${activeTab === tab ? "border-gray-800 text-gray-800" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "policies" && (
          isEditing ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                    <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.map((cat) => (
                    <Fragment key={cat.id}>
                      <TableRow sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: expandedGroups.includes(cat.id) ? "#eff6ff" : "inherit", "&:hover": { backgroundColor: expandedGroups.includes(cat.id) ? "#eff6ff" : "#f9fafb" } }}>
                        <TableCell sx={{ width: 32 }}>
                          <input
                            type="checkbox"
                            checked={cat.policies.every((p: any) => (editedUser.policies || []).includes(p.label))}
                            onChange={() => {
                              const allSelected = cat.policies.every((p: any) => (editedUser.policies || []).includes(p.label));
                              cat.policies.forEach((p: any) => {
                                if (allSelected && (editedUser.policies || []).includes(p.label)) togglePolicy(p.label);
                                else if (!allSelected && !(editedUser.policies || []).includes(p.label)) togglePolicy(p.label);
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 32, cursor: "pointer" }} onClick={() => setExpandedGroups((p) => p.includes(cat.id) ? p.filter((g) => g !== cat.id) : [...p, cat.id])}>
                          {expandedGroups.includes(cat.id) ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{cat.name}</TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
                      </TableRow>
                      {expandedGroups.includes(cat.id) && cat.policies.map((policy: any) => (
                        <TableRow key={policy.id} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#faf9f6" }}>
                          <TableCell />
                          <TableCell />
                          <TableCell sx={{ py: "0.5rem", pl: "3rem", fontSize: "0.875rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input type="checkbox" checked={(editedUser.policies || []).includes(policy.label)} onChange={() => togglePolicy(policy.label)} />
                              {policy.label}
                            </div>
                          </TableCell>
                          <TableCell sx={{ py: "0.5rem", px: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>{policy.description}</TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : viewPoliciesData.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewPoliciesData.map((p: any) => (
                    <TableRow key={p.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{p.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{p.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <p className="py-5 text-center text-gray-500 text-sm">No policies assigned</p>
        )}

        {activeTab === "groups" && (
          isEditing ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Group Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allGroups.length === 0 ? (
                    <TableRow><TableCell colSpan={3} sx={{ fontSize: "0.875rem", color: "#6b7280" }}>No groups available</TableCell></TableRow>
                  ) : allGroups.map((group: any) => (
                    <TableRow key={group._id} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ width: 32 }}>
                        <input type="checkbox" checked={(editedUser.groups || []).includes(group.groupName || group.name)} onChange={() => toggleGroup(group.groupName || group.name)} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{group.groupName || group.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{group.groupDescription || group.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : user.groups?.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Group Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {user.groups.map((g: any) => (
                    <TableRow key={g.name || g} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{g.name || g}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{g.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <p className="py-5 text-center text-gray-500 text-sm">No groups assigned</p>
        )}

        {activeTab === "roles" && (
          isEditing ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Role Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editRolesData.map((role) => (
                    <TableRow key={role.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ width: 32 }}>
                        <input type="checkbox" checked={(editedUser.roles || []).includes(role.name)} onChange={() => toggleRole(role.name)} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{role.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{role.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : viewRolesData.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Role Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewRolesData.map((r: any) => (
                    <TableRow key={r.name} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{r.name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{r.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <p className="py-5 text-center text-gray-500 text-sm">No roles assigned</p>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setIsEditing(false); setEditedUser({}); }}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveEdit} disabled={actionLoading}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
