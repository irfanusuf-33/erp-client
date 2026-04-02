import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { GripVertical } from "lucide-react";

export default function ClientProductDetails () {

    return (

        <div className={"w-full h-full bg-white"}>

            <div className="flex items-center h-[50px] px-5 bg-yellow-50">
                <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10" /></div>
                <div className="flex-1 text-xl font-bold">Product Details</div>

            </div>


                <div className="py-2.5 px-5">

                {/* Table Header */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] py-[15px] font-bold text-base text-gray-500 border-b border-gray-200">
                        <div>Product Name</div>
                        <div>Description</div>
                        <div>Price</div>
                        <div>Sale Date</div>
                        <div>Status</div>
                    </div>

                {/* Table Row (repeatable) */}
                {[1, 2, 3, 4, 5].map((item, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] py-[18px] border-b border-gray-100 items-center">
                        <div className="product-info">
                            <div className="text-[15px] font-medium">Product name here</div>
                                <div className="text-[13px] text-gray-500">PRD-0001</div>
                            </div>

                        <div className="text-[15px]">Description here</div>
                        <div className="text-[15px]">$2,000.00</div>
                        <div className="text-[15px]">04/10/2025</div>

                        <div className={`py-[5px] w-[90px] text-center rounded-[20px] font-medium text-sm ${index < 3 ? "bg-green-500/10 text-[#2b8a3e]" : "bg-orange-400/20 text-[#d48a00]"}`}>
                            {index < 3 ? "Paid" : "Pending"}
                        </div>
                    </div>
                ))}
                </div>
        </div>
    );
}