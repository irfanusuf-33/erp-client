"use client";
import { Fragment, useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useGlobalStore } from "@/store";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface Props {
  searchTerm?: string;
  selectedRoles?: string[];
  onToggleRole?: (roleId: string) => void;
  selectedPermissions?: string[];
  onTogglePermission?: (permId: string) => void;
  selectionEnabled?: boolean;
}

export default function IamUserRolesDashboard({ searchTerm = "", selectedRoles, onToggleRole, selectedPermissions, onTogglePermission, selectionEnabled = false }: Props) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const { roles: storeRoles, fetchRoles, policies: storePolicies, fetchPolicies } = useGlobalStore();
  const [loading, setLoading] = useState(false);
  const lowerSearch = searchTerm.toLowerCase();

  useEffect(() => {
    if (!storeRoles.length) { setLoading(true); fetchRoles().finally(() => setLoading(false)); }
    if (!storePolicies.length) { fetchPolicies(); }
  }, []);

  const roles = storeRoles.flatMap((cat) =>
    cat.policies.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description?.startsWith("Policies:") ? "N/A" : (p.description || "N/A"),
      permissions: (p.description?.replace("Policies: ", "").split(", ").filter(Boolean) || []).map((perm) => {
        const found = storePolicies.flatMap((cat) => cat.policies).find((sp) => sp.id === perm || sp.name === perm);
        return { id: perm, label: perm, description: found?.description ?? "" };
      }),
    }))
  );

  const filteredRoles = roles.map((role) => {
    if (role.name.toLowerCase().includes(lowerSearch)) return role;
    const matched = role.permissions.filter((p: any) => p.label.toLowerCase().includes(lowerSearch));
    return matched.length > 0 ? { ...role, permissions: matched } : null;
  }).filter(Boolean);

  useEffect(() => {
    if (!searchTerm.trim()) { setExpandedRole(null); return; }
    setExpandedRole(filteredRoles[0]?.id ?? null);
  }, [searchTerm]);

  return (
    <TableContainer sx={{ minHeight: 400 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9fafb" }}>
            <TableCell sx={{ width: 48, borderBottom: "1px solid #e5e7eb" }} />
            <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb", width: "30%" }}>Role Name</TableCell>
            <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={3} sx={{ textAlign: "center", py: 6 }}><span className="text-sm text-gray-400 animate-pulse">Loading...</span></TableCell></TableRow>
          ) : !filteredRoles.length ? (
            <TableRow><TableCell colSpan={3} sx={{ fontSize: "0.875rem", color: "#6b7280" }}>No Results Found</TableCell></TableRow>
          ) : filteredRoles.map((role: any) => (
            <Fragment key={role.id}>
              <TableRow
                sx={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer", backgroundColor: expandedRole === role.id ? "#eff6ff" : "inherit", "&:hover": { backgroundColor: expandedRole === role.id ? "#eff6ff" : "#f9fafb" } }}
                onClick={() => setExpandedRole((p) => (p === role.id ? null : role.id))}
              >
                <TableCell sx={{ width: 48 }}>
                  {expandedRole === role.id ? <Minus size={16} /> : <Plus size={16} />}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{role.name}</TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{role.description}</TableCell>
              </TableRow>
              {expandedRole === role.id && role.permissions.map((perm: any) => (
                <TableRow key={perm.id} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ width: 48 }}>
                    {selectionEnabled && (
                      <input
                        type="checkbox"
                        checked={selectedPermissions?.includes(perm.label) ?? false}
                        onChange={(e) => { e.stopPropagation(); onTogglePermission?.(perm.label); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ py: "1rem", pl: "0.75rem", fontSize: "0.875rem", color: "#1f2937" }}>{perm.label}</TableCell>
                  <TableCell sx={{ py: "1rem", px: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>{perm.description}</TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
