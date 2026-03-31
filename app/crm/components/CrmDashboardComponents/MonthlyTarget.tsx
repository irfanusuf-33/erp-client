import React from 'react'
import { GripVertical } from 'lucide-react'
import { PieChart, Pie, ResponsiveContainer } from "recharts";


interface monthlytargetProp {
  data: { name: string; value: number, fill:string }[]
}

export default function MonthlyTarget({ data }: monthlytargetProp) {

  //const COLORS = ["#FF5A4E", "#E5E7EB"]; // red + light grey

  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0 ">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Monthly Target</span>
      </div>
      <div className="w-[300px] h-[300px] relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={90}
              outerRadius={110}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold">$0k</span>
        </div>
      </div>
    </div>
  )
}
