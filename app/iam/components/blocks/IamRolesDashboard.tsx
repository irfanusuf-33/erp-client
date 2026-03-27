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

export default function IamRolesDashboard({ searchTerm = "" }: { searchTerm: string }) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const { policies: storePolicies, fetchPolicies } = useGlobalStore();
  const lowerSearch = searchTerm.toLowerCase();

  useEffect(() => {
    if (!storePolicies.length) fetchPolicies();
  }, []);

  const policies = storePolicies.map((cat) => ({
    id: cat.id,
    name: cat.id,
    description: "",
    policies: cat.policies.map((p) => ({ id: p.id, label: p.id, description: p.description })),
  }));

  const filteredRoles = policies.map((role) => {
    if (role.name.toLowerCase().includes(lowerSearch)) return role;
    const matched = role.policies.filter((p: any) => p.label.toLowerCase().includes(lowerSearch) || p.description?.toLowerCase().includes(lowerSearch));
    return matched.length > 0 ? { ...role, policies: matched } : null;
  }).filter(Boolean);

  useEffect(() => {
    if (!searchTerm.trim()) { setExpandedRole(null); return; }
    setExpandedRole(filteredRoles[0]?.id ?? null);
  }, [searchTerm]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9fafb" }}>
            <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
            <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Policy Name</TableCell>
            {expandedRole && <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {!filteredRoles.length ? (
            <TableRow><TableCell colSpan={3} sx={{ fontSize: "0.875rem", color: "#6b7280" }}>No Results Found</TableCell></TableRow>
          ) : filteredRoles.map((role: any) => (
            <Fragment key={role.id}>
              <TableRow
                sx={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer", backgroundColor: expandedRole === role.id ? "#eff6ff" : "inherit", "&:hover": { backgroundColor: expandedRole === role.id ? "#eff6ff" : "#f9fafb" } }}
                onClick={() => setExpandedRole((p) => (p === role.id ? null : role.id))}
              >
                <TableCell sx={{ width: 32 }}>{expandedRole === role.id ? <Minus size={16} /> : <Plus size={16} />}</TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{role.name}</TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{role.description}</TableCell>
              </TableRow>
              {expandedRole === role.id && role.policies.map((perm: any) => (
                <TableRow key={perm.id} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                  <TableCell />
                  <TableCell sx={{ py: "0.5rem", pl: "3rem", fontSize: "0.875rem", color: "#1f2937" }}>{perm.label}</TableCell>
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
