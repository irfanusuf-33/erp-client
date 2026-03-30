"use client";

import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbOutlineIcon from '@mui/icons-material/LightbulbOutline';
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
    <div className="ticketing-table">
      <div className="table-header">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </div>

      <div className="tickets-list">
        {filteredMessages.length === 0 ? (
          <div className='no-message-ticket-box'>
            <LightbulbOutlineIcon />
            <div>
              <h1>Global Ticket Pool</h1>
              <p>Tickets from Email, WhatsApp, etc will appear here.</p>
            </div>
          </div>
        ) : (
          filteredMessages.map((ticket, index) => (
            <div key={index} className="ticket-card">
              <div className="ticket-body">
                <div>{getSourceIcon(ticket.source)}</div>

                <div>
                  <div>{ticket.id}</div>
                  <div>{ticket.message}</div>

                  <Button onClick={() => openAssignModal(ticket)}>
                    Assign
                  </Button>
                </div>

                <div>{ticket.time}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {isAssignModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3>{canAssignDepartment ? "Assign Department" : "Assign Agent"}</h3>

            {canAssignDepartment ? (
              <select
                value={selectedDepartmentName}
                onChange={(e) => setSelectedDepartmentName(e.target.value)}
              >
                <option value="">Select Department</option>
                {departmentOptions.map(dep => (
                  <option key={dep}>{dep}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Search agent"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
              />
            )}

            <button onClick={handleAssign} disabled={isAssigningAgent}>
              {isAssigningAgent ? "Assigning..." : "Assign"}
            </button>

            <button onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketingMessagesTable;