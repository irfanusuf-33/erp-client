"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { useGlobalStore } from "@/store";
import EditGroupModal from "./modals/EditGroupModal";
import BaseTable from "@/components/ui/table/BaseTable";
import type { EditGroupModalProps } from "@/types/iam.types";

type PaginationState = { pageIndex: number; pageSize: number };

interface IamGroupsProps {
  selectionMode?: boolean;
  selectedGroups?: string[];
  onToggleGroup?: (groupName: string) => void;
}

export default function IamGroups({ selectionMode = false, selectedGroups = [], onToggleGroup }: IamGroupsProps) {
  const router = useRouter();
  const { fetchGroups, groups, iamLoading } = useGlobalStore();
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
      accessorKey: "disabled",
      header: "Status",
      Cell: ({ cell }: any) => {
        const disabled = cell.getValue();
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${disabled ? "bg-red-50 text-red-600" : "bg-green-100 text-green-700"}`}>
            {disabled ? "Disabled" : "Active"}
          </span>
        );
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
