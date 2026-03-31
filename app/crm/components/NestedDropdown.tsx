"use client";
import { useState } from "react";

type Item = {
  type: string;
  options?: {value:string; label: string;}[];
};

const DropdownItem = ({ item, onChange }: { item: Item, onChange:(value:string)=>void }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.options && item.options.length > 0;

  return (
    <div>
    
      <div
        className="flex items-center gap-2 cursor-pointer py-1 px-2 hover:bg-gray-100 rounded"
        onClick={() => hasChildren && setOpen((prev) => !prev)}
      >
        {hasChildren && (
          <span
            className={`text-xs transition-transform ${
              open ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
        )}
        <span className="text-sm">{item.type}</span>
      </div>

      {hasChildren && open && (
        <div className="ml-4 border-l border-gray-200 pl-2">
          {item.options!.map((child, index) => (
            <div
              key={index}
              className="py-1 px-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
              onClick={() => onChange(child.value)}
            >
              {child.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NestedDropdown({ data, onChange }: { data: Item[], onChange:(value:string)=>void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
     
      <div
        className="border rounded-md px-3 py-2 text-sm cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Select option</span>
        <span className={`${isOpen ? "rotate-180" : ""}`}>▼</span>
      </div>

     
      {isOpen && (
        <div className="absolute mt-1 w-full border rounded-md bg-white shadow-md max-h-[300px] overflow-y-auto z-10">
          {data.map((item, index) => (
            <DropdownItem key={index} item={item} onChange={onChange}/>
          ))}
        </div>
      )}
    </div>
  );
}