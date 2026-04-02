
"use client"
import { useState } from 'react';
import searchUsers from '../../../assets/searchUsers.svg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    reload: (gId: string) => void;
}



interface ClientInfo {
    _id: string,
    legalName: string,
    clientId: string
}

export default function AddClientToGroupModal({ isOpen, onClose, groupId, reload }: AddClientModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedClients, setSelectedClients] = useState<ClientInfo[]>([]);
    const [isSearching, setIsSearching] = useState(false);


    if (!isOpen) { return null; }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" >
            <div className="absolute inset-0 bg-black/40" />
                <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-xl p-6 z-50">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Client to Group</h3>

                    <div className="relative mb-4">
                        <Input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="input input-bordered custom-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {isSearching && (
                            <span className="absolute right-3 top-2.5 h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></span>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 mb-4">

                        {!isSearching && searchTerm.trim() === '' && (
                            <div className="text-center text-gray-500 text-sm py-6">
                                <p>Search by email to add clients to the group</p>
                            </div>
                        )}

                        {!isSearching && searchTerm.trim() !== ''  && (
                            <div className="text-center text-gray-500 text-sm py-4">
                                No clients found
                            </div>
                        )}

                    </div>

                    <div className="flex justify-end gap-3">
                        <Button onClick={()=>{}}>
                            Add ({selectedClients.length})
                        </Button>
                        <Button variant={'secondary'} onClick={() => { onClose(); setSearchTerm('');  }}>
                            Close
                        </Button>
                    </div>
                </div>
        </div>
    );
}