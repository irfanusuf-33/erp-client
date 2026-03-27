"use client";
import { useState } from "react";
import IamRolesDashboard from "./blocks/IamRolesDashboard";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function IamRoles() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="px-6 py-7 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
        Policies
        <span title="Guide to viewing and understanding all user policies.">
          <Info size={16} className="ml-2 cursor-pointer text-gray-500" />
        </span>
      </h2>
      <div className="mt-9 border border-gray-200 rounded-lg p-4 bg-white overflow-x-auto min-w-[900px]">
        <div className="relative flex justify-between items-center mb-3">
          <Input
            placeholder="Search policies"
            className="w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <IamRolesDashboard searchTerm={searchTerm} />
      </div>
    </div>
  );
}
