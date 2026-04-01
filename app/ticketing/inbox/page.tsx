'use client';

import { useEffect, useMemo, useState } from "react";
import TicketList from "../components/TicketList";
import type { Message, Ticket } from "../../../types/ticketing.types";
import TicketInbox from "../components/TicketInbox";
import TicketDetails from "../components/TicketDetails";
import socket from "../../../lib/socket";
import { useGlobalStore } from "@/store";
import { toast } from "sonner";

const normalizeTicket = (ticket: Partial<Ticket>, fallbackId: string): Ticket => ({
  _id: ticket._id || fallbackId,
  name: ticket.name || ticket.phone || ticket.ticketId || "Unknown",
  ticketId: ticket.ticketId || fallbackId,
  phone: ticket.phone || "",
  description: ticket.description || "",
  status: ticket.status || "Open",
  agents: ticket.agents || [],
  createdAt: ticket.createdAt,
  priority: ticket.priority || "medium",
  dueDate: ticket.dueDate,
  assignedTo: ticket.assignedTo,
  email: ticket.email || ticket.lastAgentDetail?.email,
  source: ticket.source,
  department: ticket.department,
  notes: ticket.notes,
  lastAgentDetail: ticket.lastAgentDetail,
});

const normalizeChat = (chat: any, idx: number): Message => ({
  id: chat?._id || chat?.id || `${idx}`,
  source: "ticket",
  message:
    chat?.message?.text ||
    (typeof chat?.message === "string" ? chat.message : "") ||
    chat?.text?.body ||
    "",
  sender:
    chat?.sender ||
    (typeof chat?.from === "string" && chat.from.includes("@") ? "me" : "other"),
  time: chat?.createdAt
    ? new Date(chat.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "Now",
  createdAt: chat?.createdAt || chat?.timestamp,
});

const matchesTicket = (ticket: Ticket, ticketId: string) =>
  ticket._id === ticketId || ticket.ticketId === ticketId;

const getTicketKey = (ticket: Partial<Ticket>, index: number) => ticket._id || ticket.ticketId || `ticket-${index}`;
const normalizePhone = (value?: string) => (value || "").replace(/\D/g, "");
const normalizeTicketId = (value: any): string => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && typeof value.$oid === "string") {
    return value.$oid;
  }
  if (typeof value?.toString === "function") {
    const converted = value.toString();
    return converted === "[object Object]" ? "" : converted;
  }
  return "";
};
const isSamePhone = (a?: string, b?: string) => {
  const left = normalizePhone(a);
  const right = normalizePhone(b);
  if (!left || !right) {
    return false;
  }
  return (
    left === right ||
    left.endsWith(right) ||
    right.endsWith(left) ||
    left.includes(right) ||
    right.includes(left) ||
    left.slice(-10) === right.slice(-10)
  );
};

const TicketingMain = () => {
  const { user, fetchInboxTickets, fetchTicketById, fetchTicketChat, fetchTicketOverview } = useGlobalStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketChats, setTicketChats] = useState<Message[]>([]);

  const handleTicketUpdate = (ticketId: string, patch: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((ticket) => (matchesTicket(ticket, ticketId) ? { ...ticket, ...patch } : ticket)),
    );
  };

  useEffect(() => {
    const loadInbox = async () => {
      setLoadingTickets(true);
      const [inboxRes, overviewRes] = await Promise.all([
        fetchInboxTickets(),
        fetchTicketOverview(200, 0),
      ]);

      if (!inboxRes.success && !overviewRes.success) {
        toast.error(inboxRes.msg || overviewRes.msg || "Failed to fetch tickets");
        setLoadingTickets(false);
        return;
      }

      const inboxTickets = Array.isArray(inboxRes.data) ? inboxRes.data : [];
      const overviewTickets = Array.isArray(overviewRes.data?.recentTickets) ? overviewRes.data.recentTickets : [];
      const mergedTickets = [...inboxTickets, ...overviewTickets];
      const dedupMap = new Map<string, Ticket>();

      mergedTickets.forEach((ticket: Partial<Ticket>, index: number) => {
        const key = getTicketKey(ticket, index);
        const existing = dedupMap.get(key);
        if (!existing) {
          dedupMap.set(key, normalizeTicket(ticket, key));
          return;
        }

        // Keep richer fields from existing record when duplicate ticket appears.
        dedupMap.set(key, normalizeTicket({ ...ticket, ...existing }, key));
      });

      const normalized = Array.from(dedupMap.values());
      setTickets(normalized.sort((a, b) => (a.createdAt || "") < (b.createdAt || "") ? 1 : -1));
      setSelectedTicketId(normalized[0]?._id || null);
      setLoadingTickets(false);

      // Hydrate ticket cards with full details so names/fields are available immediately.
      void (async () => {
        const hydrated = await Promise.all(
          normalized.map(async (ticket) => {
            const backendTicketId = ticket._id || ticket.ticketId;
            const detailRes = await fetchTicketById(backendTicketId);
            if (!detailRes.success || !detailRes.data) {
              return ticket;
            }
            return normalizeTicket({ ...ticket, ...(detailRes.data as Partial<Ticket>) }, ticket._id);
          }),
        );
        setTickets(hydrated);
      })();
    };

    loadInbox();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onIncomingInboxMessage = (payload: { ticketId?: string; messages?: any[] }) => {
      const incoming = payload?.messages?.[0];
      const incomingText =
        incoming?.text?.body ||
        incoming?.message?.text ||
        (typeof incoming?.message === "string" ? incoming.message : "") ||
        "";
      if (!incomingText) {
        return;
      }

      const incomingTicketId =
        normalizeTicketId(
          payload?.ticketId ||
        incoming?.ticket ||
        incoming?.ticketId ||
        incoming?.meta?.ticketId,
        );
      const incomingPhone = normalizePhone(incoming?.from || incoming?.wa_id);

      setTickets((prev) => {
        const matchedIndex = prev.findIndex((ticket) => {
          const byTicketId = incomingTicketId && (normalizeTicketId(ticket._id) === incomingTicketId || normalizeTicketId(ticket.ticketId) === incomingTicketId);
          const byPhone = incomingPhone && isSamePhone(ticket.phone, incomingPhone);
          return Boolean(byTicketId || byPhone);
        });

        if (matchedIndex === -1) {
          return prev;
        }

        const updated = [...prev];
        const matchedTicket = updated[matchedIndex];
        updated[matchedIndex] = {
          ...matchedTicket,
          description: incomingText,
        };

        // Promote ticket with new message to top of inbox list.
        if (matchedIndex > 0) {
          const [recentTicket] = updated.splice(matchedIndex, 1);
          updated.unshift(recentTicket);
        }
        return updated;
      });
    };

    socket.on("whatsapp_inbox_message", onIncomingInboxMessage);
    socket.on("facebook_inbox_message", onIncomingInboxMessage);

    return () => {
      socket.off("whatsapp_inbox_message", onIncomingInboxMessage);
      socket.off("facebook_inbox_message", onIncomingInboxMessage);
    };
  }, []);

  useEffect(() => {
    if (!user?._id || !user?.email || tickets.length === 0) {
      return;
    }

    const joinTicketRooms = () => {
      const roomIds = new Set<string>();
      tickets.forEach((ticket) => {
        if (ticket._id) {
          roomIds.add(ticket._id);
        }
      });

      roomIds.forEach((ticketId) => {
        socket.emit("join_room", {
          ticketId,
          email: user.email,
          agent: user.email.trim().toLowerCase(),
        });
      });
    };

    socket.on("connect", joinTicketRooms);
    joinTicketRooms();

    return () => {
      socket.off("connect", joinTicketRooms);
    };
  }, [tickets, user?._id, user?.email]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedTicketId) || null,
    [selectedTicketId, tickets],
  );

  useEffect(() => {
    const loadSelectedTicketData = async () => {
      if (!selectedTicket) {
        setLoadingDetails(false);
        setTicketChats([]);
        return;
      }

      setLoadingDetails(true);
      const backendTicketId = selectedTicket._id || selectedTicket.ticketId;

      const [showRes, chatRes] = await Promise.all([
        fetchTicketById(backendTicketId),
        fetchTicketChat(backendTicketId, 0, 10),
      ]);

      if (showRes.success && showRes.data) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id === selectedTicket._id
              ? normalizeTicket(
                {
                  ...ticket,
                  ...(showRes.data as Partial<Ticket>),
                },
                ticket._id,
              )
              : ticket,
          ),
        );
      }

      if (chatRes.success) {
        const chatList = Array.isArray(chatRes.data) ? chatRes.data : chatRes.data?.chats || [];
        const chronological = chatList
          .map(normalizeChat)
          .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        setTicketChats(chronological);
      } else {
        setTicketChats([]);
      }

      setLoadingDetails(false);
    };

    loadSelectedTicketData();
  }, [selectedTicketId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[21.5625rem_1fr_20.625rem] h-screen min-h-0 bg-[#eef1f6] overflow-hidden">
      <TicketList
        tickets={tickets}
        loading={loadingTickets}
        selectedTicketId={selectedTicketId}
        onSelect={setSelectedTicketId}
      />
      <TicketInbox selectedTicket={selectedTicket} chats={ticketChats} />
      <TicketDetails
        selectedTicket={selectedTicket}
        loading={loadingDetails}
        onTicketUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default TicketingMain;
