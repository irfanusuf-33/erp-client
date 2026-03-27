"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Plus, Trash2, FileText } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IamStepWithSetProps } from "@/types/iam.types";

export default function IamGroupsCreate({ setView, formData, setFormData }: IamStepWithSetProps) {
  const [errors, setErrors] = useState<any>({});
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useGlobalStore();
  const maxSize = 25 * 1024 * 1024;

  useEffect(() => {
    if (user?._id) setFormData((p: any) => p.admin === user._id ? p : { ...p, admin: user._id, adminName: user.username || user.email });
  }, [user]);

  useEffect(() => {
    setFormData((p: any) => ({
      ...p,
      rawFiles: uploadedDocs.length ? uploadedDocs : undefined,
      files: uploadedDocs.length ? uploadedDocs.map((f) => ({ url: "", size: (f.size / (1024 * 1024)).toFixed(2), name: f.name, type: f.type })) : undefined,
    }));
  }, [uploadedDocs]);

  const addFiles = (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    const valid = pdfs.filter((f) => f.size <= maxSize);
    if (pdfs.length - valid.length > 0) setUploadError(`${pdfs.length - valid.length} file(s) exceed 25 MB.`);
    else setUploadError("");
    setUploadedDocs((p) => {
      const merged = [...p, ...valid];
      return merged.filter((f, i, s) => s.findIndex((x) => x.name === f.name && x.size === f.size) === i);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!formData.name) errs.name = "Group name is required";
    if (!formData.code) errs.code = "Group code is required";
    if (!formData.description) errs.description = "Description is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setView(2);
  };

  return (
    <div className="px-6 py-9">
      <h1 className="text-xl font-semibold mb-4 ml-[72px]">Create Group</h1>
      <div className="mx-[72px] bg-white rounded-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Set Group Details</h2>
            <p className="text-sm text-gray-400">*Required field</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {([["name","Group Name"],["code","Group Code"]] as [string,string][]).map(([id, label]) => (
              <div key={id}>
                <label className="block text-sm font-medium mb-1">{label} <span className="text-red-500">*</span></label>
                <Input type="text" id={id} aria-invalid={!!errors[id]} value={formData[id]} onChange={(e) => { setFormData((p: any) => ({ ...p, [id]: e.target.value })); setErrors((p: any) => ({ ...p, [id]: undefined })); }} />
                {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Group Admin</label>
              <Input type="text" className="bg-gray-50" value={formData.adminName || formData.admin} disabled />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="description" rows={4} className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`} value={formData.description} onChange={(e) => { setFormData((p: any) => ({ ...p, description: e.target.value })); setErrors((p: any) => ({ ...p, description: undefined })); }} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-base font-medium text-gray-800 mb-2.5">AI Knowledge Base <Info size={14} className="text-gray-500" /></p>
              <div
                className={`min-h-[150px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
                <p className="text-base font-medium text-gray-800">Click to Upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-0.5">PDF only, maximum file size 25 MB</p>
              </div>
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>
            <div>
              <p className="text-base font-medium text-gray-800 mb-2.5">Uploaded Docs</p>
              {uploadedDocs.length === 0 ? (
                <div className="min-h-[150px] border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center p-4">
                  <p className="text-base text-gray-500 font-medium">No Docs Uploaded</p>
                </div>
              ) : (
                <div className="min-h-[150px] max-h-[220px] overflow-y-auto border border-gray-200 rounded-lg p-2.5">
                  {uploadedDocs.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="flex items-center gap-2.5 p-2 border-b last:border-0">
                      <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button type="button" className="text-red-500 hover:text-red-600 p-1 rounded" onClick={() => setUploadedDocs((p) => p.filter((f) => !(f.name === file.name && f.size === file.size)))}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/iam/groups")}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
