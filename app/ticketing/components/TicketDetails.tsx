"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import type { TicketDetailsProps } from "../../../types/ticketing.types";
import { useGlobalStore } from "@/store";

const formatDate = (value?: string) => {
  if (!value) return "Mar 8,2025 at 2:30PM";

  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TicketDetails = ({
  selectedTicket,
  loading = false,
  onTicketUpdate,
}: TicketDetailsProps) => {
  const {
    searchUsersService,
    addTicketNote,
    assignTicketToAgent,
    updateTicketStatus,
    updateTicketPriority,
  } = useGlobalStore();

  const [currentStatus, setCurrentStatus] = useState("");
  const [currentPriority, setCurrentPriority] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showNoteComposer, setShowNoteComposer] = useState(false);

  useEffect(() => {
    if (selectedTicket) {
      setCurrentStatus(selectedTicket.status || "Open");
      setCurrentPriority(selectedTicket.priority || "medium");
    }
  }, [selectedTicket]);

  if (loading) {
    return (
      <div className="ticket-empty-state">
        <p>Loading ticket details...</p>
      </div>
    );
  }

  if (!selectedTicket) {
    return (
      <div className="ticket-empty-state">
        <SearchOffOutlinedIcon />
        <p>No Tickets selected</p>
      </div>
    );
  }

  const handleStatusChange = async (value: string) => {
    setCurrentStatus(value);

    await updateTicketStatus({
      form: {
        ticketId: selectedTicket._id,
        status: value,
      },
    });

    onTicketUpdate?.(selectedTicket._id, { status: value });
  };

  const handlePriorityChange = async (value: string) => {
    setCurrentPriority(value);

    await updateTicketPriority({
      form: {
        ticketId: selectedTicket._id,
        priority: value,
      },
    });

    onTicketUpdate?.(selectedTicket._id, { priority: value });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white border-l border-[#d8dbe2]">

      {/* HEADER */}
      <div className="h-[74px] px-4 flex items-center border-b border-[#d8dbe2]">
        <h2 className="text-[30px] font-semibold text-[#20242c]">
          #{selectedTicket?.ticketId || "---"}
        </h2>
      </div>

      {/* EMPTY STATE */}
      {!selectedTicket ? (
        <div className="flex flex-1 items-center justify-center flex-col text-[#808690]">
          <SearchOffOutlinedIcon className="text-[86px] text-[#b8bbc1]" />
          <p className="mt-3 font-semibold text-[#1e2025]">
            No Ticket Selected
          </p>
          <p className="text-sm">Select a ticket to view details</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">

          {/* SECTION: Ticket Info */}
          <div className="px-4 py-4 border-b border-[#d8dbe2] flex flex-col gap-2">
            <h3 className="text-[20px] font-semibold text-[#4f79ff]">
              Ticket Info
            </h3>

            {/* STATUS */}
            <label className="text-xs text-[#7b808a] font-medium">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-[36px] px-3 flex items-center justify-between rounded-lg border border-[#d1d5db] bg-white text-sm text-[#20242c] hover:border-[#4f79ff] transition">
                {currentStatus}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["Open", "In Progress", "Closed"].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* PRIORITY */}
            <label className="text-xs text-[#7b808a] font-medium mt-2">
              Priority
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-[36px] px-3 flex items-center justify-between rounded-lg border border-[#d1d5db] bg-white text-sm text-[#20242c] hover:border-[#4f79ff] transition">
                {currentPriority}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["high", "medium", "low"].map((priority) => (
                  <DropdownMenuItem
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                  >
                    {priority}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* SECTION: NOTES */}
          <div className="px-4 py-4 border-b border-[#d8dbe2] flex flex-col gap-2">

            <button
              className="flex items-center gap-1 text-[#4f79ff] text-sm font-medium"
              onClick={() => setShowNoteComposer(true)}
            >
              <AddIcon fontSize="small" />
              Add Note
            </button>

            {showNoteComposer && (
              <div className="border border-[#d8dbe2] rounded-lg overflow-hidden bg-white">
                <textarea
                  className="w-full min-h-[78px] text-sm p-2 outline-none resize-y"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Write a note..."
                />

                <div className="flex justify-end gap-2 px-2 py-2 border-t border-[#edf0f5]">
                  <button
                    className="h-7 px-3 text-xs border border-[#cfd4df] rounded text-[#3e4654]"
                    onClick={() => setShowNoteComposer(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="h-7 px-3 text-xs bg-[#4f79ff] text-white rounded"
                    onClick={async () => {
                      if (!noteInput.trim()) return;

                      await addTicketNote(selectedTicket._id, noteInput);
                      setNoteInput("");
                      setShowNoteComposer(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: DATES */}
          <div className="px-4 py-4 border-b border-[#d8dbe2] flex flex-col gap-1">
            <label className="text-xs text-[#7b808a] font-medium">Created</label>
            <p className="text-sm text-[#20242c]">
              {formatDate(selectedTicket.createdAt)}
            </p>

            <label className="text-xs text-[#7b808a] font-medium mt-2">Due</label>
            <p className="text-sm text-[#20242c]">
              {formatDate(selectedTicket.dueDate)}
            </p>
          </div>

          {/* SECTION: DOCUMENTS */}
          <div className="px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-[#838997]">
              <InsertDriveFileOutlinedIcon fontSize="small" />
              <span>No reference documents</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TicketDetails;