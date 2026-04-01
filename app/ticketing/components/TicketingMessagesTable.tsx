"use client";

import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
// import LightbulbOutlineIcon from '@mui/icons-material/LightbulbOutline';
import {Button} from '../../../components/ui/button';
import socket from "../../../lib/socket";
import { useEffect, useMemo, useState } from 'react';
import { useGlobalStore } from "@/store";
import type { Message } from '../../../types/ticketing.types';

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'email': return <EmailIcon />;
    case 'web': return <LanguageIcon />;
    case 'whatsapp': return <WhatsAppIcon />;
    default: return null;
  }
};

function TicketingMessagesTable() {

  const {
    user,
    fetchInboxTickets,
    fetchTicketingDepartments,
    assignTicketToAgent,
    assignTicketToDepartment,
  } = useGlobalStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [isAssigningAgent, setIsAssigningAgent] = useState(false);
  const [assignedAgentsByMessage, setAssignedAgentsByMessage] = useState<Record<string, any>>({});
  const [assignedDepartmentsByMessage, setAssignedDepartmentsByMessage] = useState<Record<string, string>>({});

  /* ---------------- POLICY ---------------- */
  const policyList = useMemo(() => {
    const rawUser = (user || {}) as Record<string, any>;
    return Array.isArray(rawUser.policies) ? rawUser.policies : [];
  }, [user]);

  const hasPolicy = (policyKey: string) =>
    policyList.some((policy: any) => {
      if (typeof policy === "string") return policy.trim() === policyKey;
      if (typeof policy === "object") {
        return String(policy.name || policy.label || policy.policy || "").trim() === policyKey;
      }
      return false;
    });

  const isSuperAdmin = hasPolicy("ticketingFullAccess");
  const isAdmin = hasPolicy("ticketingDeptAccess");
  const hasRootAccess = hasPolicy("rootAccess");

  const canAssignDepartment = isSuperAdmin || hasRootAccess;

  const userDepartment = useMemo(() => {
    const rawUser = (user || {}) as Record<string, any>;
    return (
      rawUser.department ||
      rawUser.departmentName ||
      rawUser?.organizationalDetails?.departmentName ||
      ""
    );
  }, [user]);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const loadTickets = async () => {
      const res: any = await fetchInboxTickets(
        isAdmin || isSuperAdmin ? userDepartment : undefined
      );

      if (res?.success) {
        const formatted = (res.data || []).map((ticket: any) => ({
          id: ticket.ticketId,
          ticketId: ticket.ticketId,
          objectId: ticket._id,
          ticketRaw: ticket,
          agents: ticket.agents || [],
          source: ticket.source,
          message: ticket.description,
          sender: ticket.name,
          department: ticket.department,
          time: ticket.createdAt
            ? new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
        }));
        setMessages(formatted);
      }
    };

    loadTickets();
  }, [isAdmin, isSuperAdmin, userDepartment]);

  useEffect(() => {
    if (!canAssignDepartment) return;

    const loadDepartments = async () => {
      const res: any = await fetchTicketingDepartments();
      if (res?.success) setDepartmentOptions(res.data || []);
    };

    loadDepartments();
  }, [canAssignDepartment]);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const eventName = isSuperAdmin
      ? "whatsapp_global_message"
      : isAdmin && userDepartment
        ? `whatsapp_${userDepartment}`
        : null;

    if (!eventName) return;

    socket.on(eventName, ({ messages }: any) => {
      const formatted = (messages || []).map((msg: any, idx: number) => ({
        id: msg?.id || `wa-${idx}-${Date.now()}`,
        ticketId: msg?.ticketId,
        source: 'whatsapp',
        message: msg?.text?.body || msg?.message || "",
        sender: msg?.from || "Unknown",
        time: new Date().toLocaleTimeString(),
      }));

      setMessages(prev => [...formatted, ...prev]);
    });

    return () => {
      socket.off(eventName);
    };
  }, [isSuperAdmin, isAdmin, userDepartment]);

  /* ---------------- FILTER ---------------- */
  const filteredMessages = useMemo(() => {
    if (!searchTerm) return messages;

    const term = searchTerm.toLowerCase();

    return messages.filter(msg =>
      String(msg.message).toLowerCase().includes(term) ||
      String(msg.sender).toLowerCase().includes(term) ||
      String(msg.id).toLowerCase().includes(term)
    );
  }, [messages, searchTerm]);

  /* ---------------- ASSIGN ---------------- */
  const openAssignModal = (message: Message) => {
    setSelectedMessage(message);
    setIsAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedMessage) return;

    setIsAssigningAgent(true);

    const id = (selectedMessage as any).objectId || selectedMessage.ticketId;

    const res = canAssignDepartment
      ? await assignTicketToDepartment(id, selectedDepartmentName)
      : await assignTicketToAgent(id, selectedAgent?._id);

    setIsAssigningAgent(false);

    if (res?.success) {
      if (canAssignDepartment) {
        setAssignedDepartmentsByMessage(prev => ({
          ...prev,
          [selectedMessage.id]: selectedDepartmentName,
        }));
      } else {
        setAssignedAgentsByMessage(prev => ({
          ...prev,
          [selectedMessage.id]: selectedAgent,
        }));
      }
      setIsAssignModalOpen(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
<div className="border border-[#d1d5db] rounded-[0.5rem] p-[1rem] bg-white mb-[5rem]">

  {/* HEADER */}
  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-[0.625rem] mb-[1rem] pb-[1rem] border-b border-[#d1d5db]">
    
    <div className="relative w-full md:w-[25rem]">
      <input
        type="text"
        placeholder="Search"
        className="w-full text-[0.875rem] border border-[#d1d5db] rounded-[0.5rem] pl-[2.25rem] pr-[0.75rem] py-[0.625rem]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <SearchIcon className="absolute left-[0.625rem] top-[0.75rem] text-[#929292] text-[1.125rem]" />
    </div>

  </div>

  {/* LIST */}
  <div className="flex flex-col gap-[0.75rem]">

    {filteredMessages.length === 0 ? (
      <div className="border border-[#d1d5db] rounded-[0.5rem] p-[0.75rem] flex text-[0.9375rem] text-[#424650]">
        
        <div className="mr-[0.625rem] mt-[0.375rem] w-[2.1875rem] h-[2.8125rem] flex items-center justify-center text-[#2563eb]">
          {/* icon optional */}
        </div>

        <div className="w-full">
          <div className="bg-[#2563eb] text-white rounded-[0.3125rem] mt-[0.625rem] mb-[1.25rem] h-[2.5rem] flex items-center justify-center text-[0.875rem] font-semibold sm:w-[11.625rem] sm:h-[2.8125rem] sm:text-[1rem]">
            Global Ticket Pool
          </div>

          <p className="text-[0.8125rem] sm:text-[0.9375rem]">
            Tickets from Email, WhatsApp, etc will appear here.
          </p>
        </div>
      </div>
    ) : (
      filteredMessages.map((ticket, index) => (
        <div
          key={index}
          className="border border-[#d1d5db] rounded-[0.375rem] p-[0.75rem] flex flex-col"
        >
          <div className="flex justify-between items-start gap-[0.75rem]">

            {/* ICON */}
            <div className="border border-[#2563eb] rounded-full p-[0.25rem] mr-[1rem]">
              <div className="text-[1.75rem] text-[#2563eb]">
                {getSourceIcon(ticket.source)}
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <div className="text-[#3B8AEC] font-semibold mb-[0.25rem]">
                {ticket.id}
              </div>

              <div className="text-[#0F141A] text-[0.875rem] mb-[0.75rem]">
                {ticket.message}
              </div>

              <div className="flex justify-between items-center flex-wrap gap-[0.75rem]">
                <span className="text-[#424650] font-medium">
                  {ticket.sender}
                </span>

                <div className="flex items-center gap-[0.5rem] flex-wrap">
                  <span className="border border-[#d1d5db] bg-[#f3f4f6] text-[#424650] rounded-full px-[0.625rem] py-[0.25rem] text-[0.75rem]">
                    {assignedAgentsByMessage[ticket.id] && (
                      <span className="assigned-agent-pill">
                        {assignedAgentsByMessage[ticket.id].fName} {assignedAgentsByMessage[ticket.id].lName}
                      </span>
                    )}
                    {assignedDepartmentsByMessage[ticket.id] && (
                      <span className="assigned-agent-pill">
                        {assignedDepartmentsByMessage[ticket.id]}
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() => openAssignModal(ticket)}
                    className="bg-[#2563eb] text-white text-[0.75rem] px-[0.75rem] py-[0.375rem] rounded-[0.375rem]"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            {/* TIME */}
            <div className="text-[0.75rem] text-[#929292]">
              {ticket.time}
            </div>
          </div>
        </div>
      ))
    )}

  </div>

  {/* MODAL */}
  {isAssignModalOpen && (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-[92vw] max-w-[47.5rem] rounded-[0.75rem] border border-[#d1d5db] bg-gradient-to-b from-white to-[#f9fafb] shadow-lg p-[1.375rem] md:p-[1.5rem]">

        <h3 className="text-[1.25rem] font-semibold text-[#0F141A]">
          {canAssignDepartment ? "Assign Department" : "Assign Agent"}
        </h3>

        <p className="text-[0.875rem] text-[#424650] mt-[0.25rem] mb-[1rem]">
          Select an option below
        </p>

        {canAssignDepartment ? (
          <select
            value={selectedDepartmentName}
            onChange={(e) => setSelectedDepartmentName(e.target.value)}
            className="w-full mb-[0.875rem] h-[2.75rem] border border-[#d1d5db] rounded-[0.5rem] px-[0.75rem]"
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dep) => (
              <option key={dep}>{dep}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Search agent"
            value={agentSearch}
            onChange={(e) => setAgentSearch(e.target.value)}
            className="w-full mb-[0.875rem] h-[2.75rem] border border-[#d1d5db] rounded-[0.5rem] px-[0.75rem] focus:border-[#3b8aec] focus:ring-2 focus:ring-[rgba(59,138,236,0.1)] outline-none"
          />
        )}

        <div className="flex justify-end gap-[0.5rem] pt-[0.25rem]">
          <button
            onClick={() => setIsAssignModalOpen(false)}
            className="border border-[#d1d5db] bg-white text-[#424650] min-w-[7.5rem] h-[2.5rem] rounded-[0.5rem]"
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={isAssigningAgent}
            className="bg-[#2563eb] text-white min-w-[8rem] h-[2.5rem] rounded-[0.5rem] font-semibold shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
          >
            {isAssigningAgent ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}

export default TicketingMessagesTable;