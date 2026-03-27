"use client";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { IamStepWithSetProps } from "@/types/iam.types";
function generatePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function IamUsersCreate({ setView, formData, setFormData }: IamStepWithSetProps) {
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((p: any) => ({ ...p, [id]: value }));
    setErrors((p: any) => ({ ...p, [id]: undefined }));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchUser(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/hrm/employee/search?searchTerm=${value}`);
        setSearchResults(res.data?.data || res.data?.employees || []);
      } catch { setSearchResults([]); }
      setLoading(false);
    }, 500);
  };

  const handleSelectEmployee = (emp: any) => {
    setFormData((p: any) => ({ ...p, fName: emp.personalDetails?.firstName || "", lName: emp.personalDetails?.lastName || "", email: emp.contactDetails?.email || "" }));
    setSearchUser(""); setSearchResults([]); setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!formData.fName) errs.fName = "First name is required";
    if (!formData.lName) errs.lName = "Last name is required";
    if (!formData.email) errs.email = "Email is required";
    if (!formData.pwd) errs.pwd = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setView(2);
  };

  return (
    <div className="px-6 py-12">
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Set User Details</h2>
              <p className="text-sm text-gray-400">*Required field</p>
            </div>
            <Button type="button" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => setShowImport(!showImport)}>
              Import User {showImport ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
          {showImport && (
            <div className="relative">
              <Input placeholder="Search Employee" value={searchUser} onChange={handleSearchChange} />
              {loading && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>}
              {searchResults.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full max-h-48 overflow-y-auto">
                  <ul>{searchResults.map((emp, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectEmployee(emp)}>
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(emp.personalDetails?.firstName?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{`${emp.personalDetails?.firstName || ""} ${emp.personalDetails?.lastName || ""}`.trim()}</div>
                        <div className="text-xs text-gray-500">{emp.contactDetails?.email}</div>
                      </div>
                    </li>
                  ))}</ul>
                </div>
              )}
            </div>
          )}
          {([["fName","First Name","text"],["lName","Last Name","text"],["email","Email","email"]] as [string,string,string][]).map(([id, label, type]) => (
            <div key={id}>
              <label className="block text-sm font-medium mb-1">{label} <span className="text-red-500">*</span></label>
              <Input type={type} id={id} aria-invalid={!!errors[id]} value={formData[id]} onChange={handleChange} />
              {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
            </div>
          ))}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
              <Input type={showPassword ? "text" : "password"} id="pwd" aria-invalid={!!errors.pwd} value={formData.pwd} onChange={handleChange} className="pr-10" />
              <button type="button" className="absolute right-2 top-8 text-gray-400" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.pwd && <p className="text-red-500 text-xs mt-1">{errors.pwd}</p>}
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={() => setFormData((p: any) => ({ ...p, pwd: generatePassword() }))} className="bg-blue-600 hover:bg-blue-700 text-white">Generate</Button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" id="forceMfa" checked={formData.forceMfa || false} onChange={(e) => setFormData((p: any) => ({ ...p, forceMfa: e.target.checked }))} />
            Force MFA Login
          </label>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/iam/users")}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
