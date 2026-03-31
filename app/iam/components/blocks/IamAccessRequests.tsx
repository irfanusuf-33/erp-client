import { GripVertical } from "lucide-react";

export default function IamAccessRequests() {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Access Requests</span>
      </div>
      <div className="border-t border-gray-200 flex flex-col items-center justify-center flex-1 pt-4">
        <span className="text-gray-400 text-sm">Coming Soon</span>
      </div>
    </div>
  );
}
