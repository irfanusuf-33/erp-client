import { GripVertical, Pencil, Check } from 'lucide-react'
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface ClientAddressProp {
    postalCode: string,
    streetNumber:string,
    streetName:string,
    city:string,
    country:string
}

export default function ClientAddress({clientData}: {clientData:ClientAddressProp})
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
                        <div className="font-bold flex-1">Postal Code: </div>
                        {editMode ? (
                            <div className="crm-client-address-text">
                                <Input
                                    type="text"
                                    // value={editedData.zipCode ?? clientData?.data?.zipCode}
                                    // onChange={(e) => setEditedData({ ...editedData, zipCode: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.postalCode}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Street Number: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.streetNumber ?? clientData?.data?.streetNumber}
                                    // onChange={(e) => setEditedData({ ...editedData, streetNumber: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.streetNumber}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Street Name: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.streetName ?? clientData?.data?.streetName}
                                    // onChange={(e) => setEditedData({ ...editedData, streetName: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.streetName}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">City: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.city ?? clientData?.data?.city}
                                    // onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.city}</div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="font-bold flex-1">Country: </div>
                        {editMode ? (
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    // value={editedData.country ?? clientData?.data?.country}
                                    // onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">{clientData?.country}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}