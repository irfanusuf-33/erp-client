import BorderColorIcon from '@mui/icons-material/BorderColor';
import SaveIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { GripVertical, UserCircle, Pencil, Check } from 'lucide-react'

interface ClientInfoProps {
    name:string,
    organizationId: string, 
    phone:string,
    email:string,
    website:string
}

export default function ClientInfo ( { clientData }: {clientData: ClientInfoProps }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loader, setLoader] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsEditing(false);
    };
    if (!clientData) {
        return <div>Loading client data...</div>;
    }
    return (

        <div className="w-full h-full bg-white">
            <div className="flex justify-start items-center gap-2.5 pt-5">
                <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10"/></div>
                <div className="h-15 w-15 flex justify-center items-center"><UserCircle className='w-12 h-12'/></div>
                <div className="text-base flex-1">
                    {isEditing ? (
                        <Input
                            type="text"
                            // value={editedData.legalName ?? clientData.data.legalName}
                            // onChange={(e) => setEditedData({ ...editedData, legalName: e.target.value })}
                        />
                    ) : (
                        <h1 className="font-bold text-xl">{clientData.name}</h1>
                    )}
                </div>
                <div className="flex items-center justify-center h-12.5 w-12.5 mr-2.5" onClick={isEditing ? handleSave : handleEdit}>
                    {isEditing ? <Check /> : <Pencil />}
                </div>
            </div>

            <div className="p-5 leading-7.5 overflow-y-auto max-h-[calc(100%-6.25rem)]">
                <div className="crm-client-card-body-labels">
                    <div className="flex justify-between">
                        <div className="font-bold">Organization ID:</div>
                        <div className="text-left w-1/2">{clientData.organizationId}</div>

                    </div>
                    <div className="flex justify-between">
                        <div className="font-bold">Phone:</div>
                        {isEditing ? (
                            <div className="crm-client-address-label-title-value ">
                                <Input
                                    type="text"
                                    // value={editedData.phone }
                                    // onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="text-left w-1/2 underline">
                                <a href={`tel:${clientData.phone}`} rel='noreferrer'>{clientData.phone}</a>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <div className="font-bold">Email:</div>
                        {isEditing ? (
                            <div className="w-1/2">
                                <Input
                                    type="text"
                                    // value={editedData.email ?? clientData.data.email}
                                    // onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="text-left w-1/2 text-blue-700">
                                <a href={`mailto:${clientData.email}`}  rel='noreferrer'>{clientData.email}</a>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <div className="font-bold">Website:</div>
                        {isEditing ? (
                            <div className="crm-client-address-label-title-value crm-client-card-body-website">
                                <Input
                                    type="text"
                                    // value={editedData.website ?? clientData.data.website}
                                    // onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="text-left w-1/2 text-blue-700">
                                <a href={clientData.website} target='_blank'  rel='noreferrer'>{clientData.website}</a>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}