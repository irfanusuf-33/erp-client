"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Info, XCircle, CheckCircle } from "lucide-react";
import { useGlobalStore } from "@/store";
import EditGroupModal from "../components/modals/EditGroupModal";
import BaseTable from "@/components/shared/BaseTable";
import type { EditGroupModalProps } from "@/types/iam.types";

type PaginationState = { pageIndex: number; pageSize: number };

function PoliciesCell({ policies }: { policies: string[] }) {
  const [open, setOpen] = useState(false);
  if (!policies?.length) return <span className="text-gray-400">-</span>;
  const visible = policies.slice(0, 3);
  const extra = policies.length - 3;
  return (
    <>
      <div className="flex flex-wrap gap-1 items-center">
        {visible.map((p) => <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{p}</span>)}
        {extra > 0 && (
          <button onClick={() => setOpen(true)} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">+{extra}</button>
        )}
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-800">All Policies</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto max-h-72 px-6 pb-5">
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

interface IamGroupsProps {
  selectionMode?: boolean;
  selectedGroups?: string[];
  onToggleGroup?: (groupName: string) => void;
}

export default function GroupsPage({ selectionMode = false, selectedGroups = [], onToggleGroup }: IamGroupsProps) {
  const router = useRouter();
  const { fetchGroups, groups, iamLoading, toggleGroupStatus } = useGlobalStore();
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState<EditGroupModalProps["groupData"]>(null);

  useEffect(() => {
    fetchGroups(selectionMode ? 1 : pagination.pageIndex + 1, selectionMode ? 100 : pagination.pageSize).then((res) => {
      if (res?.data?.count?.data) setRowCount(res.data.count.data);
    });
  }, [pagination.pageIndex, pagination.pageSize]);

  const selectionColumns = [
    {
      id: "select",
      header: "",
      size: 40,
      Cell: ({ row }: any) =>
        onToggleGroup ? (
          <input
            type="checkbox"
            checked={selectedGroups.includes(row.original.groupName)}
            onChange={() => onToggleGroup(row.original.groupName)}
          />
        ) : null,
    },
    { accessorKey: "groupName", header: "Group Name" },
    {
      accessorKey: "groupDescription",
      header: "Description",
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
  ];

  const mainColumns = [
    {
      accessorKey: "groupName",
      header: "Group Name",
      Cell: ({ cell }: any) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={() => router.push(`/iam/groups/${cell.getValue()}`)}
        >
          {cell.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "groupDescription",
      header: "Description",
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      Cell: ({ cell }: any) => cell.getValue() || "-",
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      Cell: ({ cell }: any) => cell.getValue() ? new Date(cell.getValue()).toLocaleString("en-GB") : "-",
    },
    {
      accessorKey: "policies",
      header: "Policies",
      Cell: ({ cell }: any) => <PoliciesCell policies={cell.getValue() as string[]} />,
    },
    {
      accessorKey: "disabled",
      header: "Status",
      Cell: ({ cell }: any) => {
        const disabled = cell.getValue();
        return disabled ? (
          <div className="flex items-center gap-1.5"><XCircle size={16} className="text-red-600" /><span className="text-red-600">Disabled</span></div>
        ) : (
          <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-700" /><span className="text-green-700">Active</span></div>
        );
      },
    },
  ];

  const toolbarActions = [
    {
      label: (selected: any[]) => selected.every((g) => g.disabled) ? "Enable" : "Disable",
      onClick: async (selected: any[]) => {
        await toggleGroupStatus(selected.map((g) => g._id));
        fetchGroups(pagination.pageIndex + 1, pagination.pageSize).then((res) => {
          if (res?.data?.count?.data) setRowCount(res.data.count.data);
        });
      },
    },
  ];

  return (
    <div className="px-6 py-7">
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
        <BaseTable
          data={groups}
          columns={selectionColumns}
          isLoading={iamLoading}
        />
      ) : (
        <BaseTable
          data={groups}
          columns={mainColumns}
          isLoading={iamLoading}
          enableRowSelection
          toolbarActions={toolbarActions}
          manualPagination
          rowCount={rowCount}
          state={{ pagination }}
          onPaginationChange={setPagination}
          onExportRows={() => {}}
        />
      )}

      {!selectionMode && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onNext={() => { setIsEditModalOpen(false); fetchGroups(pagination.pageIndex + 1, pagination.pageSize); }}
          groupData={editGroupData}
          setGroupData={setEditGroupData}
        />
      )}
    </div>
  );
}
