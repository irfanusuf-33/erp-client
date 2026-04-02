import { GripVertical, Pencil, Check } from 'lucide-react'
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface ClientContactProp {
    firstname:string,
    lastName:string,
    email:string,
    phone:string,
    social:string
}

export default function ClientContact({clientData}: {clientData:ClientContactProp})
{

    const handleSave =()=>{
        setEditMode(false)
    }

    const handleEdit =()=>{
        setEditMode(true)
    }

    const [editMode, setEditMode] = useState(false)
    return(
        <div className={"w-full h-full bg-white"}>
            <div className="flex justify-start items-center gap-2.5 h-[50px] bg-yellow-50">
                <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10" /></div>
                <div className="flex items-center text-xl font-bold flex-1">Address Information</div>
                <div className="h-[50px] w-[50px] flex items-center justify-center mr-2.5" onClick={editMode ? handleSave : handleEdit}>
                    {editMode ? <Check /> : <Pencil />}
                </div>
            </div>

            <div className="p-5 leading-10 overflow-y-auto max-h-[calc(100%-50px)]">
                <div className="crm-client-address-infos">
                    <div className="flex">
                        <div className="font-bold flex-1">First Name: </div>
                        {editMode ? (
                            <div className="crm-client-address-text">
                                <Input
                                    type="text"
                                    // value={editedData.zipCode ?? clientData?.data?.zipCode}
                                    // onChange={(e) => setEditedData({ ...editedData, zipCode: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.firstname}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Last Name: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.streetNumber ?? clientData?.data?.streetNumber}
                                    // onChange={(e) => setEditedData({ ...editedData, streetNumber: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.lastName}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Contact Email: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.streetName ?? clientData?.data?.streetName}
                                    // onChange={(e) => setEditedData({ ...editedData, streetName: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.email}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Contact Phone: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.city ?? clientData?.data?.city}
                                    // onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.phone}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Social: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.country ?? clientData?.data?.country}
                                    // onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.social}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}