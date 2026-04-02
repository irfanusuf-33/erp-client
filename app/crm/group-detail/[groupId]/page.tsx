"use client"

import { useState } from 'react';
import type { MRT_ColumnDef } from 'material-react-table';
import AddIcon from '@mui/icons-material/Add';
import { Check, X, MoreVertical, Edit, Ban} from 'lucide-react'
import BaseTable from '@/components/shared/BaseTable';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import AddClientToGroupModal from '../../components/AddClientToGroupModal';

type userInfo = {
    clientId: string;
    name: string;
    email: string;
}
interface GroupDetails {
    _id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt?: string;
    disabled?: boolean;
    page: number;
    total: number;
    totalPages: number;
    users: userInfo[];
}

export default function CrmGroupDetails() {
    const { groupId } = useParams()
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [groupInfo, setGroupInfo] = useState<GroupDetails>({
        _id: '',
        name: 'software development',
        description: 'heyy, this is softwrae development group',
        createdBy: 'Mudasir',
        createdAt: '02/04/2026',
        disabled:false,
        page: 0,
        total: 0,
        totalPages: 0,
        users: [],
    });

    const [loading, setLoading] = useState(false);
    // const [pagination, setPagination] = useState<MRT_PaginationState>({
    //     pageIndex: 0,
    //     pageSize: 10,
    // });
    const [rowCount, setRowCount] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');


    const [topDropdownOpen, setTopDropdownOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // const [editedData, setEditedData] = useState({ name: '', description: '' });
    const [loader, setLoader] = useState(false);

    const clientsInfo = [
        { clientId: '1672728', name: 'hey client', email: 'client@gmail.com' },
        { clientId: '1672721', name: 'hey client2', email: 'client2@gmail.com' },
        { clientId: '1672722', name: 'hey client3', email: 'client3@gmail.com' },
        { clientId: '1672723', name: 'hey client4', email: 'client4@gmail.com' }
    ]


    if (!groupId) { return; }



    const handleEdit = () => {
        setIsEditing(true);
        setTopDropdownOpen(false);
    };


    const columns: MRT_ColumnDef<userInfo>[] = clientsInfo.length > 0
        ? Object.keys(clientsInfo[0]).map((key) => {
            if (key === 'clientId') {
                return {
                    accessorKey: key,
                    header: 'Client ID',
                    Cell: ({ row }) => (
                        <span
                            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                            onClick={() => (`/crm/client-detail/${row.original.clientId}`)}
                        >
                            {row.original.clientId}
                        </span>
                    ),
                };
            }
            return {
                accessorKey: key,
                header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            };
        })
        : [];

    const toolbarActions = [
        {
            label: 'Remove',
            onClick: (selectedClients: userInfo[]) => {
                if (selectedClients.length > 0) {

                }
            },
        },
    ];

    const toolbarQuickActions = [
        {
            label: 'Add Client to Group',
            icon: <AddIcon />,
            onClick: () => setIsAddClientModalOpen(true),
            alwaysEnabled: true
        },
    ];

    return (
        <div className="p-9 gap-10.5 overflow-y-auto">
            <div className="border border-gray-300 shadow-sm p-5 p-3 flex flex-col rounded-lg">
                <div className='flex justify-between border-b border-gray-300'>
                    <h1 className="text-2xl font-semibold text-gray-900 pl-4 w-full pb-2">Client Group Details</h1>
                    <DropdownMenu open={topDropdownOpen} onOpenChange={setTopDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm"><MoreVertical size={20} className="text-gray-600" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}><Edit size={14} />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}><Ban size={14} />{groupInfo.disabled? 'Enable':'Disable'}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col p-4 rounded font-normal">
                        <span className="text-base font-semibold text-gray-900 mb-1">Group Name:</span>
                        {isEditing ? (
                            <Input
                                type="text"
                            // value={editedData.name}
                            // onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            />
                        ) : (
                            <span className="text-sm text-gray-700 font-normal">{groupInfo.name}</span>
                        )}
                    </div>
                    <div className="flex flex-col p-4 rounded font-normal">
                        <span className="text-base font-semibold text-gray-900 mb-1">Description:</span>
                        {isEditing ? (
                            <Input
                                type="text"
                            // value={editedData.description}
                            // onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                            />
                        ) : (
                            <span className="text-sm text-gray-700 font-normal">{groupInfo.description || '-'}</span>
                        )}
                    </div>
                    <div className="flex flex-col p-4 rounded font-normal">
                        <span className="text-base font-semibold text-gray-900 mb-1">Created By:</span>
                        <span className="text-sm text-gray-700 font-normal">{groupInfo.createdBy || '-'}</span>
                    </div>
                    <div className="flex flex-col p-4 rounded font-normal">
                        <span className="text-base font-semibold text-gray-900 mb-1">Created At:</span>
                        <span className="text-sm text-gray-700 font-normal">{groupInfo.createdAt || '-'}</span>
                    </div>
                </div>
                {isEditing && (
                    <div className="flex gap-3 justify-end mt-4">
                        <Button variant={'outline'} onClick={() => setIsEditing(false)} className="cancel-btn">
                            <X className='mr-1 w-4' />
                            Cancel
                        </Button>
                        <Button onClick={() => { }} disabled={loader} className="save-btn">
                            {loader ? <span className="loading loading-spinner loading-sm"></span> : <Check className='w-4 mr-1' />}
                            Save
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-9 border border-gray-300 shadow-sm rounded-xl p-9 bg-white">
                <h1 className="border-b border-gray-300 pb-3 mb-4 text-lg font-semibold">Clients in Group</h1>


                <BaseTable
                    data={clientsInfo}
                    columns={columns}
                    enableRowSelection
                    toolbarActions={toolbarActions}
                    toolbarQuickActions={toolbarQuickActions}
                    isLoading={loading}
                    manualPagination
                    rowCount={rowCount}
                    // state={{ pagination, globalFilter }}
                    // onPaginationChange={handlePaginationChange}
                    onGlobalFilterChange={setGlobalFilter}
                    onExportRows={() => { }}
                />
            </div>

            <AddClientToGroupModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                groupId={groupInfo._id}
                reload={() => {}}
            />
        </div>
    );
}
