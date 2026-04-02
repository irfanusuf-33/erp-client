import { GripVertical } from "lucide-react";

export default function FollowUps () {
    const items = [
        {
            date: "July 24,2025",
            time: "11:30 PM",
            title: "Follow up on Pricing Proposal",
        },
        {
            date: "July 24,2025",
            time: "11:30 PM",
            title: "Follow up on Pricing Proposal",
        },
        {
            date: "July 24,2025",
            time: "11:30 PM",
            title: "Follow up on Pricing Proposal",
        },
    ];

    return (

        <div className="w-full bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">

            <div className="font-bold text-[18px] h-[56px] flex items-center px-4 bg-yellow-50">
                <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10" /></div>
                Follow Ups
            </div>

            <div className="p-3">

                {items.map((it, idx) => (
                <div className="flex gap-3 py-3 items-start border-b border-black/[0.04] last:border-b-0" key={idx}>
                    <div className="w-[120px] min-w-[100px] flex flex-col items-start">
                        <div className="font-bold text-sm leading-[1.1]">{it.date}</div>
                        <div className="text-xs text-gray-500 mt-1.5">{it.time}</div>
                </div>
                <div className="flex-1">
                    <div className="text-sm">{it.title}</div>
                </div>
                </div>
                ))}
            </div>
        </div>
    );
}