"use client"
import React from 'react'
import { GripVertical } from 'lucide-react'

interface KeyIndicatorProp {
  data: {label:string; value:number}[]
}

export default function KeyIndicator({data}:KeyIndicatorProp) {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0 ">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Key Indicator</span>
      </div>
      <div className="bg-white rounded-lg p-4 font-sans flex gap-2  [&>*]:flex-1">
        {data?.map((k, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg  font-sans border border-blue-600 py-3 text-center">
            <p className="font-bold text-lg text-black">{k.value}</p>
            <p className="text-sm text-gray-600 mt-1">{k.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
