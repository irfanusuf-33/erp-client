"use client";

import { useState } from "react";
import type { TicketFormData } from "../../../types/ticketing.types";
import { useGlobalStore } from "@/store";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const CreateTicket = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { createTicket } = useGlobalStore();

    // ✅ replaced location.state
    const ownerName = searchParams.get("ownerName") || "";
    const ownerNumber = searchParams.get("ownerNumber") || "";

    const [formData, setFormData] = useState<TicketFormData>({
        description: "",
        name: ownerName,
        phone: ownerNumber,
        priority: "medium",
        status: "Open",
        dueDate: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await createTicket(formData);

            if (res.success) {
                toast.success("Ticket created successfully!");
                router.push("/ticketing");
            } else {
                toast.error(res.msg || "Failed to create ticket.");
            }
        } catch {
            toast.error("An error occurred while creating the ticket.");
        }
    };

    return (
        <div className="px-6 py-12">

        {/* PAGE TITLE */}
        <h2 className="text-[20px] font-semibold mb-4">
            Create Ticket
        </h2>

        {/* CARD */}
        <div className="mx-auto mt-10 max-w-[700px] bg-white rounded-lg p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]">

            {/* HEADER */}
            <div className="flex flex-col gap-1.5">
            <h3 className="text-[18px] font-semibold">
                Ticket Details
            </h3>

            <p className="text-sm text-[#929292]">
                Please fill in the details to create a support ticket.
            </p>

            <p className="text-[13px] text-[#3b8aec]">
                * All fields are required
            </p>
            </div>

            {/* DIVIDER */}
            <div className="my-4 border-t border-[#d1d5db]" />

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col">

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* OWNER NAME */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                    Owner Name
                </label>

                <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!!ownerName}
                    className="h-10 px-3 rounded-md border border-[#d1d5db] text-sm outline-none focus:border-[#3b8aec]"
                />

                {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">
                    {formErrors.name}
                    </p>
                )}
                </div>

                {/* OWNER NUMBER */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                    Owner Number
                </label>

                <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!!ownerNumber}
                    className="h-10 px-3 rounded-md border border-[#d1d5db] text-sm outline-none focus:border-[#3b8aec]"
                />

                {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                    {formErrors.phone}
                    </p>
                )}
                </div>

                {/* PRIORITY */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                    Priority
                </label>

                <select
                    id="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="h-10 px-3 rounded-md border border-[#d1d5db] text-sm bg-white outline-none focus:border-[#3b8aec]"
                >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                </div>

                {/* STATUS */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                    Status
                </label>

                <select
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="h-10 px-3 rounded-md border border-[#d1d5db] text-sm bg-white outline-none focus:border-[#3b8aec]"
                >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                </select>
                </div>

                {/* DUE DATE */}
                <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                    Due Date
                </label>

                <input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="h-10 px-3 rounded-md border border-[#d1d5db] text-sm outline-none focus:border-[#3b8aec]"
                />
                </div>

                {/* DESCRIPTION (FULL WIDTH) */}
                <div className="flex flex-col sm:col-span-2">
                <label className="text-sm font-semibold mb-1">
                    Ticket Description
                </label>

                <input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    className="h-10 px-3 rounded-md border border-[#d1d5db] text-sm outline-none focus:border-[#3b8aec]"
                />
                </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">

                <button
                type="button"
                onClick={() => router.push("/ticketing/inbox")}
                className="px-6 py-2 rounded-full border border-[#3b8aec] text-[#3b8aec] text-sm font-semibold hover:bg-[#3b8aec] hover:text-white transition"
                >
                Cancel
                </button>

                <button
                type="submit"
                className="px-6 py-2 rounded-md bg-[#2563eb] text-white text-sm font-semibold shadow-[0_4px_6px_-1px_rgba(37,99,235,0.2)]"
                >
                Create
                </button>

            </div>

            </form>
        </div>
        </div>
    );
};

export default CreateTicket;