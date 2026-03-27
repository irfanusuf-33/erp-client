"use client";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ChevronRight, ChevronUp } from "lucide-react";
import { useGlobalStore } from "@/store";
import EditGroupModal from "./modals/EditGroupModal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { EditGroupModalProps } from "@/types/iam.types";

interface IamGroupsProps {
  selectionMode?: boolean;
  selectedGroups?: string[];
  onToggleGroup?: (groupName: string) => void;
}

export default function IamGroups({ selectionMode = false, selectedGroups = [], onToggleGroup }: IamGroupsProps) {
  const router = useRouter();
  const { fetchGroups, groups, iamLoading, toggleGroupStatus } = useGlobalStore();
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState<EditGroupModalProps["groupData"]>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    fetchGroups(selectionMode ? 1 : page, selectionMode ? 100 : limit).then((res) => {
      if (res?.data?.count?.data) setRowCount(res.data.count.data);
    });
  }, [page]);

  return (
    <div className="px-6 py-7 overflow-y-auto">
      {!selectionMode && (
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
          Groups
          <div className="relative group flex items-center ml-2">
            <Info size={16} className="cursor-pointer text-gray-500" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
              <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
              <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">
                A user group is the collection of Voctrum users.
              </div>
            </div>
          </div>
        </h2>
      )}

      {selectionMode ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                <TableCell sx={{ width: 32, borderBottom: "1px solid #e5e7eb" }} />
                <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Group Name</TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {iamLoading ? (
                <TableRow><TableCell colSpan={4} sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Loading groups...</TableCell></TableRow>
              ) : groups.length === 0 ? (
                <TableRow><TableCell colSpan={4} sx={{ fontSize: "0.875rem", color: "#6b7280" }}>No groups available</TableCell></TableRow>
              ) : groups.map((group) => {
                const isExpanded = expandedGroupId === group._id;
                return (
                  <Fragment key={group._id}>
                    <TableRow sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ width: 32 }}>
                        {onToggleGroup && (
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.groupName)}
                            onChange={() => onToggleGroup(group.groupName)}
                          />
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ width: 32, cursor: "pointer" }}
                        onClick={() => setExpandedGroupId((p) => (p === group._id ? null : group._id))}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{group.groupName}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{group.groupDescription || "-"}</TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <div className="shadow-md rounded-lg overflow-hidden bg-white">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    {["Group Name", "Description", "Created By", "Status"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 500, fontSize: "0.875rem", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {iamLoading ? (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: "center", py: "2.5rem", color: "#6b7280", fontSize: "0.875rem" }}>Loading...</TableCell></TableRow>
                  ) : groups.map((group) => (
                    <TableRow key={group._id} sx={{ borderBottom: "1px solid #e5e7eb", "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ fontSize: "0.875rem" }}>
                        <span
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={() => router.push(`/iam/groups/${group.groupName}`)}
                        >
                          {group.groupName}
                        </span>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{group.groupDescription || "-"}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#1f2937" }}>{(group as any).createdByUser?.username || "-"}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${group.disabled ? "bg-red-50 text-red-600" : "bg-green-100 text-green-700"}`}>
                          {group.disabled ? "Disabled" : "Active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-600">Total: {rowCount}</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                <span className="text-sm px-2">Page {page}</span>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50" disabled={groups.length < limit} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {!selectionMode && (
        <EditGroupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onNext={() => { setIsEditModalOpen(false); fetchGroups(page, limit); }} groupData={editGroupData} setGroupData={setEditGroupData} />
      )}
    </div>
  );
}
