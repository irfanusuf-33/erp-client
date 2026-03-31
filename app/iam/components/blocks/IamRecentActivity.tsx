import { Circle, GripVertical } from "lucide-react";

const activities = [
  { text: `"User John added to 'Finance Group'..."`, date: "Mar 12 2025, 11:05 AM" },
  { text: `"Policy '123' updated..."`, date: "Mar 12 2025, 10:41 AM" },
  { text: `"Role 'Admin' assigned to Alice..."`, date: "Mar 12 2025, 09:52 AM" },
];

export default function IamRecentActivity() {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col overflow-auto">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Recent Activity</span>
      </div>
      <ul className="border-t border-gray-200 list-none p-0 m-0 flex-1 overflow-y-auto">
        {activities.map((a, i) => (
          <li key={i} className="flex justify-between items-center py-4 border-b border-gray-200 last:border-0">
            <a href="#" className="flex items-center gap-3 text-blue-600 no-underline text-[15px] hover:underline">
              <Circle size={16} className="text-blue-600 flex-shrink-0" />
              {a.text}
            </a>
            <span className="text-[13px] text-gray-500 flex-shrink-0 ml-4">{a.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
