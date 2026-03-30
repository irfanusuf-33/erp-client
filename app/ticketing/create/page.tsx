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
        <div className="create-ticket-wrapper">
            <h2 className="create-ticket-title">Create Ticket</h2>
            <div className="create-ticket-card">
                <div className="create-ticket-header">
                    <h3 className="create-ticket-header-title">Ticket Details</h3>
                    <p className="create-ticket-subtext">
                        Please fill in the details to create a support ticket.
                    </p>
                    <p className="create-ticket-required-note">* All fields are required</p>
                </div>

                <hr className="create-ticket-divider" />

                <form className="create-ticket-form" onSubmit={handleSubmit}>
                    <div className="create-ticket-grid">

                        <div className="create-ticket-form-group">
                            <label className="create-ticket-label">Owner Name</label>
                            <input
                                id="name"
                                className="create-ticket-input"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!!ownerName}
                            />
                            {formErrors.name && (
                                <p className="form-error-text">{formErrors.name}</p>
                            )}
                        </div>

                        <div className="create-ticket-form-group">
                            <label className="create-ticket-label">Owner Number</label>
                            <input
                                id="phone"
                                className="create-ticket-input"
                                type="text"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!!ownerNumber}
                            />
                            {formErrors.phone && (
                                <p className="form-error-text">{formErrors.phone}</p>
                            )}
                        </div>

                        <div className="create-ticket-form-group">
                            <label className="create-ticket-label">Priority</label>
                            <select
                                id="priority"
                                className="create-ticket-input"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div className="create-ticket-form-group">
                            <label className="create-ticket-label">Status</label>
                            <select
                                id="status"
                                className="create-ticket-input"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Closed</option>
                            </select>
                        </div>

                        <div className="create-ticket-form-group">
                            <label className="create-ticket-label">Due Date</label>
                            <input
                                id="dueDate"
                                className="create-ticket-input"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="create-ticket-form-group full-width">
                            <label className="create-ticket-label">
                                Ticket Description
                            </label>
                            <input
                                id="description"
                                className="create-ticket-input"
                                type="text"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="create-ticket-actions">
                        <button
                            className="create-ticket-btn-outline"
                            type="button"
                            onClick={() => router.push("/ticketing/inbox")}
                        >
                            Cancel
                        </button>

                        <button
                            className="create-ticket-btn-primary"
                            type="submit"
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