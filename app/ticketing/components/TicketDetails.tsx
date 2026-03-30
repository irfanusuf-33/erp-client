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
    <div className="ticketing-item contact">
      <div className="ticket-id">#{selectedTicket.ticketId}</div>

      <div className="contact-details">
        {/* STATUS */}
        <div className="section">
          <div className="section-title">Ticket Info</div>

          <label>Status</label>
          <DropdownMenu>
            <DropdownMenuTrigger className="ticket-value">
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
          <label>Priority</label>
          <DropdownMenu>
            <DropdownMenuTrigger className="ticket-value">
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

        {/* NOTES */}
        <div className="section">
          <button
            className="add-note-btn"
            onClick={() => setShowNoteComposer(true)}
          >
            <AddIcon /> Add Note
          </button>

          {showNoteComposer && (
            <div className="note-composer">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />

              <button
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
          )}
        </div>

        {/* DATES */}
        <div className="section">
          <label>Created</label>
          <p>{formatDate(selectedTicket.createdAt)}</p>

          <label>Due</label>
          <p>{formatDate(selectedTicket.dueDate)}</p>
        </div>

        {/* DOCS */}
        <div className="section">
          <div className="doc-item">
            <InsertDriveFileOutlinedIcon />
            <p>No reference documents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;