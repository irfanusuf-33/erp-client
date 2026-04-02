import { GripVertical } from "lucide-react";

interface TicketItem {
    id: string;
    number: string;
    description: string;
    status: 'Pending' | 'Resolved';
}

export default function ClientTicketStatus () {
    const tickets: TicketItem[] = [
        {
            id: '1',
            number: '987654',
            description: 'Lorem ipsum dolor sit amet, consectetur......',
            status: 'Pending'
        },
        {
            id: '2',
            number: '987654',
            description: 'Lorem ipsum dolor sit amet, consectetur......',
            status: 'Resolved'
        },
        {
            id: '3',
            number: '987654',
            description: 'Lorem ipsum dolor sit amet, consectetur......',
            status: 'Pending'
        },
        {
            id: '4',
            number: '987654',
            description: 'Lorem ipsum dolor sit amet, consectetur......',
            status: 'Resolved'
        }
    ];

    return (

        <div className="w-full h-full bg-white">

            <div className="font-bold text-xl h-[50px] flex items-center bg-yellow-50">
                <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10" /></div>
                Ticket Status
            </div>

            <div className="p-4 flex flex-col gap-4">

                {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex flex-col gap-2 p-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex justify-between items-center gap-3">
                            <span className="font-semibold text-sm text-gray-900">Ticket # {ticket.number}</span>
                            <span className={`py-[5px] px-3 rounded-[20px] text-xs font-semibold whitespace-nowrap w-[90px] text-center 
                                ${ticket.status==='Pending'?'bg-yellow-50 text-orange-500'
                                  :ticket.status==='Resolved'?'bg-green-50 text-green-600'
                                  :''}`}
                            >
                                {ticket.status}
                            </span>
                    </div>
                    <div className="text-[13px] text-gray-600 leading-[18px]">
                            {ticket.description}
                    </div>
                    </div>
                ))}
            </div>
        </div>
    );
}