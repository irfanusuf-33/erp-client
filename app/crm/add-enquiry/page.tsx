"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { AddEnquiryType } from '@/types/crm.types';

export default function AddEnquiry() {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<AddEnquiryType>({} as AddEnquiryType)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const router = useRouter()

    const contactSource = ['Phone', 'Email', 'Meeting']

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!formData.enquiryDate) newErrors.enquiryDate = "Enquiry Date is required";
        if (!formData.source) newErrors.source = "Contact Source is required";
        if (!formData.note) newErrors.note = "Enquiry Note is required";

        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Enquiry Details</h1>

            <form onSubmit={handleSubmit}>
                {/* Group Details */}
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-1">Enquiry Date</h2>
                    <p className="text-sm text-gray-500 mb-4">*Required field</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Enquiry Date<span className="text-red-500">*</span></label>
                            <Input id='enquiryDate' type='date' placeholder="Enter Enquiry Date" value={formData.enquiryDate || ""} onChange={handleChange} required />
                            {errors.enquiryDate && <p className="mt-1 text-xs text-red-500">{errors.enquiryDate}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Contact Source<span className="text-red-500">*</span></label>
                            <select id="source" className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={formData.source || ""} onChange={handleChange}>
                                <option value="">Select Contact Source</option>
                                {contactSource.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                            {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source}</p>}
                        </div>
                    </div>

                    {/* Notes*/}
                    <div className="grid grid-cols-1 gap-1 mt-5">
                        <label className="text-sm font-medium block">Notes/Remarks<span className="text-red-500">*</span></label>
                        <textarea id='note' className="w-full border border-input rounded-md px-2.5 py-1 text-sm" rows={3} value={formData.note} onChange={handleChange} placeholder="Enter your enquiry" />
                        {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note}</p>}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center mt-7">
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" size="sm" type="button" onClick={() => router.push("/crm/manage-clients")}>Cancel</Button>
                            <Button size="sm" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>


            </form >
        </div>

    )
}
