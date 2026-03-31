"use client";
import { Fragment, useEffect, useState } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useGlobalStore } from "@/store";
import type { RolesTableProps } from "@/types/iam.types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function RolesTable({ selectedPermissions, onTogglePermission }: RolesTableProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const { policies: storePolicies, fetchPolicies } = useGlobalStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storePolicies.length) { setLoading(true); fetchPolicies().finally(() => setLoading(false)); }
  }, []);

  const policies = storePolicies.map((cat) => ({
    id: cat.id,
    name: cat.id,
    description: "",
    policies: cat.policies.map((p) => ({ id: p.id, label: p.id, description: p.description })),
  }));

  return (
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
          {loading ? (
            <TableRow><TableCell colSpan={4} sx={{ textAlign: "center", py: 6 }}><span className="text-sm text-gray-400 animate-pulse">Loading...</span></TableCell></TableRow>
          ) : policies.map((role) => (
            <Fragment key={role.id}>
              <TableRow sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: expandedRole === role.id ? "#eff6ff" : "inherit", "&:hover": { backgroundColor: expandedRole === role.id ? "#eff6ff" : "#f9fafb" } }}>
                <TableCell sx={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={role.policies.every((p: any) => selectedPermissions.includes(p.label))}
                    onChange={(e) => {
                      e.stopPropagation();
                      const allSelected = role.policies.every((p: any) => selectedPermissions.includes(p.label));
                      role.policies.forEach((p: any) => {
                        if (allSelected && selectedPermissions.includes(p.label)) onTogglePermission(p.label);
                        else if (!allSelected && !selectedPermissions.includes(p.label)) onTogglePermission(p.label);
                      });
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{ width: 32, cursor: "pointer" }}
                  onClick={() => setExpandedRole((prev) => (prev === role.id ? null : role.id))}
                >
                  {expandedRole === role.id ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{role.name}</TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{role.description}</TableCell>
              </TableRow>
              {expandedRole === role.id && role.policies.map((perm: any) => (
                <TableRow key={perm.id} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#faf9f6" }}>
                  <TableCell />
                  <TableCell />
                  <TableCell sx={{ py: "0.5rem", pl: "3rem", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.label)}
                        onChange={() => onTogglePermission(perm.label)}
                      />
                      {perm.label}
                    </div>
                  </TableCell>
                  <TableCell sx={{ py: "0.5rem", px: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>{perm.description}</TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
