import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { GripVertical } from "lucide-react";

export default function ClientFinancialInformation () {

  return (
    <div className="w-full bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">

      {/* Header */}
      <div className="flex items-center px-5 h-[55px] bg-[#f8f3e7] rounded-t-[10px]">
        <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10" /></div>
        <div className="text-[18px] font-bold text-black">Financial Information</div>

      </div>

      <div className="p-5">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr] text-base font-semibold text-black pb-2.5 border-b border-black/15">
          <div>Invoices</div>
          <div>Amount</div>
          <div>Status</div>
        </div>

        {/* Invoice Rows */}
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-[14px] border-b border-black/[0.08]">
          <div className="font-semibold text-[15px]">
            INV - 4234
            <div className="text-[13px] text-[#7d7d7d] mt-[3px]">Due: 2025-04-02</div>
          </div>
          <div className="font-semibold">$5,000.00</div>
            <span className="py-[5px] w-[90px] text-center rounded-[20px] font-medium text-sm   bg-red-500/10 text-[#d9534f]">Overdue</span>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-[14px] border-b border-black/[0.08]">
          <div className="font-semibold text-[15px]">
            INV - 4234
            <div className="text-[13px] text-[#7d7d7d] mt-[3px]">Due: 2025-04-02</div>
          </div>
          <div className="font-semibold">$5,000.00</div>
            <span className="py-[5px] w-[90px] text-center rounded-[20px] font-medium text-sm   bg-orange-400/20 text-[#d48a00]">Pending</span>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-[14px] border-b border-black/[0.08]">
          <div className="font-semibold text-[15px]">
            INV - 4234
            <div className="text-[13px] text-[#7d7d7d] mt-[3px]">Due: 2025-04-02</div>
          </div>
          <div className="font-semibold">$5,000.00</div>
            <span className="py-[5px] w-[90px] text-center rounded-[20px] font-medium text-sm bg-green-500/10 text-[#2b8a3e]">Paid</span>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-[14px] border-b border-black/[0.08]">
          <div className="font-semibold text-[15px]">
            INV - 4234
            <div className="text-[13px] text-[#7d7d7d] mt-[3px]">Due: 2025-04-02</div>
          </div>
          <div className="font-semibold">$5,000.00</div>
            <span className="py-[5px] w-[90px] text-center rounded-[20px] font-medium text-sm     bg-green-500/10 text-[#2b8a3e]">Paid</span>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-[14px] border-b border-black/[0.08]">
          <div className="font-semibold text-[15px]">INV - 4234
            <div className="text-[13px] text-[#7d7d7d] mt-[3px]">Due: 2025-04-02</div>
          </div>
          <div className="font-semibold">$5,000.00</div>
            <span className="py-[5px] w-[90px] text-center rounded-[20px] font-medium text-sm     bg-green-500/10 text-[#2b8a3e]">Paid</span>
        </div>
      </div>
    </div>
  );
}