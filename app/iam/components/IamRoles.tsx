"use client";
import { useState } from "react";
import IamRolesDashboard from "./blocks/IamRolesDashboard";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function IamRoles() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="px-6 py-7 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          Policies
          <div className="relative group flex items-center ml-2">
            <Info size={16} className="cursor-pointer text-gray-500" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
              <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
              <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 leading-snug w-72">
                Guide to viewing and understanding all user policies.
              </div>
            </div>
          </div>
        </h2>
        <Input
          placeholder="Search policies"
          className="w-70"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto min-w-[900px] min-h-[450px]">
        <IamRolesDashboard searchTerm={searchTerm} />
      </div>
    </div>
  );
}
