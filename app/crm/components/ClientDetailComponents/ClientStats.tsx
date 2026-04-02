import { GripVertical } from "lucide-react";

export default function ClientStats () {

    return (

        <div className="w-full h-full bg-white">

            <div className="font-bold text-xl  h-[50px] flex items-center bg-yellow-50">
                <div><GripVertical size={20} className="drag-handle cursor-move text-gray-400 w-10" /></div>
                Client Stats
            </div>

            <div className="my-5 mx-10">

                <div className="flex justify-between mt-2.5 font-bold text-[17px]">
                    Total Revenue
                    <div className="text-primary">$32,500</div>
                </div>

                <div className="flex justify-between mt-2.5 font-bold text-[17px]">
                    Active Products
                    <div className="text-primary">3</div>
                </div>

                <div className="flex justify-between mt-2.5 font-bold text-[17px]">
                    Support Tickets
                    <div className="text-primary">3</div>
                </div>
            </div>
        </div>
    );
}