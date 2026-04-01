"use client"

import React, { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { PieChart, Pie, ResponsiveContainer } from "recharts";

interface KpiMeterProps {
  data: { name: string; value: number; fill: string }[]
}

export default function KpiMeter({ data }: KpiMeterProps) {

  const [showChartFor, setShowChartFor] = useState('')
  const [metric, setMetric] = useState('Sales')
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0 ">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <div className='flex justify-between w-full' >
          <span>KPI Meter</span>
          <select
            className="text-sm border border-gray-300 rounded px-1.5 py-0.5 bg-white cursor-pointer"
            value={'Monthly'}
            onChange={(e) => setShowChartFor(e.target.value)}
          >
            <option>Monthly</option>
            <option>Yearly</option>
            <option>Quaterly</option>
          </select>
        </div>

      </div>
      <div>
        <select
          className="w-full p-2 text-sm border border-gray-300 rounded mb-4 cursor-pointer"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          <option>Sales</option>
          <option>Growth</option>
        </select>
      </div>

          <div className="w-full max-w-[420px] h-[220px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="90%"           
            innerRadius={150}
            outerRadius={180}
            stroke="none"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
        <span className="text-xl font-semibold">$0</span>
        <span className="text-gray-500 text-sm">Sales</span>
      </div>

      {/* Bottom Labels */}
      <div className="absolute bottom-0 left-5 text-sm text-gray-600">
        0
      </div>
      <div className="absolute bottom-0 right-5 text-sm text-gray-600">
        50K
      </div>
    </div>
    </div>
  )
}
