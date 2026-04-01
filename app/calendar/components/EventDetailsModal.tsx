"use client";
import moment from "moment";
import { Users, Clock, Mail, FileText, X } from "lucide-react";
import { useGlobalStore } from "@/store";

interface Props {
  isOpen: boolean;
  event: { name?: string; title?: string; type?: string; startDate: Date; endDate: Date; description?: string; attendies?: any[]; organizer?: string; organizerName?: string; meetingLink?: string; } | null;
  onClose: () => void; onEdit: () => void; onDelete: () => void;
  onRespond?: (status: "accepted" | "rejected") => void;
  respondingStatus?: "accepted" | "rejected" | null;
}

export default function EventDetailsModal({ isOpen, event, onClose, onEdit, onDelete, onRespond, respondingStatus = null }: Props) {
  if (!isOpen || !event) return null;

  const { user } = useGlobalStore();
  const loggedInUser = (user as any)?._id || (user as any)?.id;
  const isOrganizer = String(event.organizer || "") === String(loggedInUser || "");

  const formatDate = (start: Date, end: Date) =>
    `${moment(start).format("ddd DD-MM-YYYY HH:mm")} to ${moment(end).format("HH:mm")}`;

  const getStatusBadge = (status: string) => {
    if (status === "accepted") return <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-sm font-medium bg-green-100 text-green-600">✓ accepted</span>;
    if (status === "rejected") return <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-sm font-medium bg-red-100 text-red-500">✕ rejected</span>;
    return <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-sm font-medium bg-orange-100 text-orange-500">⟳ Pending</span>;
  };

  const getCurrentUserStatus = () => {
    const uid = String((user as any)?._id || (user as any)?.id || "").trim();
    const uemail = String((user as any)?.email || "").trim().toLowerCase();
    const attendee = (event.attendies || []).find((a: any) => {
      const aid = String(a?.userId || "").trim();
      const aemail = String(a?.userEmail || a?.email || "").trim().toLowerCase();
      return (uid && aid === uid) || (uemail && aemail === uemail);
    });
    return attendee?.status || "No response yet";
  };

  const currentUserStatus = String(getCurrentUserStatus()).toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/45 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-[650px] max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8 pb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Event Details</h2>
          <button className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-3xl leading-none p-1 rounded transition-colors" onClick={onClose}><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-10 pb-6 space-y-4">
          <div className="flex gap-5 items-start">
            <Users size={28} className="text-blue-600 flex-shrink-0 mt-1" />
            <span className="text-lg font-medium text-gray-900 dark:text-zinc-100 flex-1 border-b border-gray-300 dark:border-zinc-800 pb-4">{event.name || event.title}</span>
          </div>

          <div className="flex gap-5 items-start">
            <Clock size={28} className="text-blue-600 flex-shrink-0 mt-1" />
            <span className="text-lg font-medium text-gray-900 dark:text-zinc-100 flex-1 border-b border-gray-300 dark:border-zinc-800 pb-4">{formatDate(event.startDate, event.endDate)}</span>
          </div>

          <div className="flex gap-5 items-start">
            <Mail size={28} className="text-blue-600 flex-shrink-0 mt-1" />
            {isOrganizer ? (
              <div className="flex-1 border-b border-gray-300 dark:border-zinc-800 pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium text-gray-900 dark:text-zinc-100">{event.organizerName || "You"}</div>
                    <div className="text-sm text-gray-500">Organizer</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-sm font-medium bg-green-100 text-green-600">Host</span>
                </div>
                {(event.attendies || []).map((attendee: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium text-gray-900 dark:text-zinc-100">{typeof attendee === "string" ? attendee.split("@")[0] : attendee.userName || attendee.userEmail?.split("@")[0] || "Unknown"}</div>
                      <div className="text-sm text-gray-500">{typeof attendee === "string" ? attendee : attendee.userEmail || attendee.email || "N/A"}</div>
                    </div>
                    {getStatusBadge(typeof attendee === "string" ? "pending" : attendee.status || "pending")}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 border-b border-gray-300 dark:border-zinc-800 pb-4">
                <p className="text-base text-gray-800 dark:text-zinc-100"><strong>{event.organizerName}</strong> invited you to this event</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">Your response: <strong>{currentUserStatus}</strong></p>
              </div>
            )}
          </div>

          <div className="flex gap-5 items-start">
            <FileText size={28} className="text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-sm text-gray-500 dark:text-zinc-400 flex-1 border-b border-gray-300 dark:border-zinc-800 pb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description || "No description provided" }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[200px] px-10 py-8">
          {event.meetingLink && (
            <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors" onClick={() => window.open(event.meetingLink, "_blank")}>Join Meeting</button>
          )}
          {isOrganizer ? (
            <div className="flex gap-3">
              <button className="px-8 py-2.5 bg-white dark:bg-zinc-900 text-red-500 border-2 border-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" onClick={onDelete}>Cancel</button>
              <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors" onClick={onEdit}>Update</button>
            </div>
          ) : (
            currentUserStatus === "pending" && onRespond && (
              <div className="flex gap-3">
                <button className="px-8 py-2.5 bg-white dark:bg-zinc-900 text-red-500 border-2 border-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60" onClick={() => onRespond("rejected")} disabled={respondingStatus === "rejected"}>{respondingStatus === "rejected" ? "..." : "Reject"}</button>
                <button className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60" onClick={() => onRespond("accepted")} disabled={respondingStatus === "accepted"}>{respondingStatus === "accepted" ? "..." : "Accept"}</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
