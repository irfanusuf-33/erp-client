"use client"

import React from 'react'
import { GripVertical } from 'lucide-react'

interface OverviewProp {
  data:{label:string; value:number}[]
}

export default function Overview({data}: OverviewProp) {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0 "> 
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Overview</span>
      </div>
      <div className="grid grid-cols-2 gap-5 mt-2">
         {data?.map((item, idx) => (
          <div key={idx} className="bg-orange-200 rounded-lg py-3 text-center">
            <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            <p className="font-bold text-lg text-black">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
