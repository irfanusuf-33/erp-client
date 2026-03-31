import React from 'react'
import { GripVertical } from 'lucide-react'

export default function Reminders() {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0 ">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Reminders</span>
      </div>
      <div className="border-t border-gray-200 flex flex-col items-center justify-center gap-6 flex-1 overflow-y-auto pt-4">
        
      </div>
    </div>
  )
}
