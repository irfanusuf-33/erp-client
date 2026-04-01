"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { AddGroupType } from '@/types/crm.types';

export default function AddGroup() {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddGroupType>({} as AddGroupType)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const router = useRouter()

  const handleAddGroup = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Group Name is required";
    if (!formData.description) newErrors.description = "Group Description is required";


    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Client Group</h1>

      <form onSubmit={handleAddGroup}>
        {/* Group Details */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Group Details</h2>
          <p className="text-sm text-gray-500 mb-4">*Required field</p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Group Name <span className="text-red-500">*</span></label>
              <Input id='name' placeholder="Enter Group name" value={formData.name || ""} onChange={handleChange} required />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Group Description<span className="text-red-500">*</span></label>
              <textarea id='description' className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={3} value={formData.description} onChange={handleChange} placeholder="Enter your message" />
              {errors.desciption && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
          </div>
        </div>



        {/* Form Actions */}
        <div className="flex items-center">
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" type="button" onClick={() => router.push("/crm/manage-groups")}>Cancel</Button>
            <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Group..." : "Create Group"}
            </Button>
          </div>
        </div>

      </form>
    </div>

  )
}
