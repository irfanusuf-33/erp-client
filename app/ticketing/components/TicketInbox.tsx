import { useEffect, useRef, useState } from "react";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import type { Message, TicketInboxProps } from "../../../types/ticketing.types";
import socket from "../../../lib/socket";
import { useGlobalStore } from "@/store";
import { toast } from "sonner";

const formatTicketTime = (value?: string) => {
  if (!value) {
    return "Mar 8,2025 at 2:30PM";
  }

  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getMessageText = (value: any): string => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return (
      value?.text?.body ||
      value?.message?.text ||
      (typeof value?.message === "string" ? value.message : "") ||
      ""
    );
  }
  return "";
};

const normalizeInboxMessage = (chat: Message, idx: number, ticketSource?: string): Message & { senderName?: string; displayTime?: string } => ({
  id: chat?.id || `${idx}`,
  source: chat?.source || ticketSource || "ticket",
  message: getMessageText(chat?.message),
  sender: chat?.sender === "me" ? "me" : "other",
  senderName: (chat as any)?.senderName || (chat as any)?.name || (chat as any)?.senderDisplayName,
  time: chat?.time || "Now",
  createdAt: chat?.createdAt,
  displayTime: chat?.createdAt
    ? new Date(chat.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : chat?.time || "Now",
  status: chat?.status,
  attachmentName: chat?.attachmentName,
});

const normalizePhone = (value?: string) => (value || "").replace(/\D/g, "");
const lastDigits = (value?: string, size = 10) => {
  const digits = normalizePhone(value);
  return digits ? digits.slice(-size) : "";
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
    lastDigits(left) === lastDigits(right)
  );
};

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

const normalizeAgentId = (value: any): string => {
  if (!value) {
    return "";
  }
  if (typeof value === "object") {
    const candidate =
      value._id ??
      value.id ??
      value.userId ??
      value.agentId ??
      value.$oid ??
      value;
    return normalizeTicketId(candidate);
  }
  return normalizeTicketId(value);
};

const TicketInbox = ({ selectedTicket, chats = [] }: TicketInboxProps) => {
  const {user, sendTicketMessage} = useGlobalStore();
  const currentUserEmail = (user?.email || "").trim().toLowerCase();
  const currentUserIdCandidates = [
    normalizeAgentId((user as any)?.id),
    normalizeAgentId((user as any)?._id),
    normalizeAgentId((user as any)?.userId),
    normalizeAgentId((user as any)?.agentId),
  ].filter(Boolean);
  const assignedAgentIds = Array.isArray(selectedTicket?.agents)
    ? selectedTicket.agents.map((agentId) => normalizeAgentId(agentId)).filter(Boolean)
    : [];
  const hasAssignedAgents = assignedAgentIds.length > 0;
  const isCurrentUserAssigned = hasAssignedAgents
    ? assignedAgentIds.some((agentId) => currentUserIdCandidates.includes(agentId))
    : false;
  const canCurrentUserChat = hasAssignedAgents && isCurrentUserAssigned;
  const [messagesByTicket, setMessagesByTicket] = useState<Record<string, Message[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const isSendingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const appendMessageToTicket = (ticketKey: string, message: Message) => {
    setMessagesByTicket((prev) => ({
      ...prev,
      [ticketKey]: [...(prev[ticketKey] || []), message],
    }));
  };

  useEffect(() => {
    if (!selectedTicket) {
      return;
    }

    const ticketId = selectedTicket._id;
    const normalizedChats = chats.map((chat, idx) => normalizeInboxMessage(chat, idx, selectedTicket.source));
    console.log("[ticketing/inbox] selectedTicket", selectedTicket);
    console.log("[ticketing/inbox] normalizedChats", { ticketId, normalizedChats });
    setMessagesByTicket((prev) => {
      const existing = prev[ticketId] || [];

      // Keep already received realtime/local messages. Hydrate from API when cache is empty.
      if (existing.length > 0) {
        return prev;
      }

      return {
        ...prev,
        [ticketId]: normalizedChats,
      };
    });
  }, [selectedTicket, chats]);

  useEffect(() => {
    setMessageQueue([]);
    setAttachedFile(null);
  }, [selectedTicket?._id]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      if (!selectedTicket || !user?._id) {
        return;
      }
      if (!selectedTicket._id) {
        return;
      }
      socket.emit("join_room", {
        ticketId: selectedTicket._id,
        email: user.email,
        agent: currentUserEmail,
      });
    };

    const onConnectError = (err: Error) => {
      toast.error(`Socket connection failed: ${err.message || "Unknown error"}`)
    };

    const onInboxMessage = (payload: { ticketId?: string; messages?: any[] }) => {
      console.log("[ticketing/inbox] socket payload", payload);
      if (!selectedTicket) {
        return;
      }

      const incoming = payload?.messages?.[0];
      if (!incoming) {
        return;
      }
      const incomingText =
        incoming?.text?.body ||
        incoming?.message?.text ||
        incoming?.message ||
        "";
      if (!incomingText) {
        return;
      }

      const payloadTicketId = normalizeTicketId(
        payload?.ticketId ||
        incoming?.ticket ||
        incoming?.ticketId ||
        incoming?.meta?.ticketId,
      );
      const currentIds = [selectedTicket._id, selectedTicket.ticketId]
        .map((id) => normalizeTicketId(id))
        .filter(Boolean);
      if (payloadTicketId && !currentIds.includes(payloadTicketId)) {
        return;
      }
      if (!payloadTicketId) {
        const incomingPhone = incoming?.from || incoming?.wa_id || incoming?.phone;
        const selectedPhone = selectedTicket.phone;
        if (incomingPhone && selectedPhone && !isSamePhone(incomingPhone, selectedPhone)) {
          return;
        }
      }

      const incomingMessageId = normalizeTicketId(incoming?._id || incoming?.id || incoming?.message?.mid) || `${Date.now()}`;
      const msg: any = {
        id: incomingMessageId,
        source: selectedTicket.source === "page" ? "facebook" : selectedTicket.source,
        message: incomingText,
        sender: "other",
        senderName: incoming?.sender || incoming?.name || incoming?.from || "",
        time: "Now",
      };
      console.log("[ticketing/inbox] received real-time message", msg);

      setMessagesByTicket((prev) => {
        const existing = prev[selectedTicket._id] || [];
        if (existing.some((entry) => entry.id === incomingMessageId)) {
          return prev;
        }
        return {
          ...prev,
          [selectedTicket._id]: [...existing, msg],
        };
      });
    };

    socket.on("connect", joinRoom);
    socket.on("connect_error", onConnectError);
    socket.on("whatsapp_inbox_message", onInboxMessage);
    socket.on("facebook_inbox_message", onInboxMessage);
    joinRoom();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("connect_error", onConnectError);
      socket.off("whatsapp_inbox_message", onInboxMessage);
      socket.off("facebook_inbox_message", onInboxMessage);
    };
  }, [selectedTicket?._id, selectedTicket?.ticketId, user?._id, user?.email, currentUserEmail]);

  const formattedMessages = selectedTicket
    ? (messagesByTicket[selectedTicket._id] || [])
        .map((message) => ({ ...message, message: getMessageText(message.message) }))
        .filter((message) => message.message.trim().length > 0)
    : [];
  const ticketStatus = (selectedTicket?.status ?? "").toLowerCase();
  const isClosedTicket = ticketStatus === "closed";
  const closedTicketNote = typeof selectedTicket?.notes === "string" && selectedTicket.notes.trim().length > 0
    ? selectedTicket.notes
    : "This ticket has been closed. Messaging is disabled for closed tickets.";

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTop = 0;
  }, [selectedTicket?._id]);

  const handleSendMessage = () => {
    if (!selectedTicket) {
      return;
    }
    if (!canCurrentUserChat) {
      toast.error("Chat Restricted: Only assigned users can chat on this ticket.");
      return;
    }

    const trimmedMessage = messageInput.trim();
    const destinationPhone = (selectedTicket.phone || "").trim();
    if (!trimmedMessage && !attachedFile) {
      return;
    }
    console.log("selectedTicket", selectedTicket);  
    if (!destinationPhone) {
      let sourceLabel = "WhatsApp";
      if (selectedTicket.source === "page") {sourceLabel = "Facebook";}
      else if (selectedTicket.source === "instagram") { sourceLabel = "Instagram"; }
      toast.error(`Send Failed: This ticket has no ${sourceLabel} contact information.`);
      return;
    }
    if (!currentUserEmail) {
      toast.error("Send Failed: No agent account found for this session.");
      return;
    }

    const composedMessage = trimmedMessage || `[Attachment] ${attachedFile?.name || ""}`;

    const newMessage: Message = {
      id: `${selectedTicket._id}-${Date.now()}`,
      source: "ticket",
      message: composedMessage,
      sender: "me",
      time: "Just now",
      createdAt: new Date().toISOString(),
      status: "sending",
      attachmentName: attachedFile?.name,
    };

    appendMessageToTicket(selectedTicket._id, newMessage);
    setMessageInput("");
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const sendNow = async () => {
      const backendTicketId = selectedTicket._id || selectedTicket.ticketId;
      const res = await sendTicketMessage(
        backendTicketId,
        destinationPhone,
        composedMessage,
        currentUserEmail,
        selectedTicket.source,
        selectedTicket.senderId
      );

      if (!res.success) {
        throw new Error(res.msg || "Failed to send message");
      }
    };

    sendNow()
      .then(() => {
        setMessagesByTicket((prev) => ({
          ...prev,
          [selectedTicket._id]: (prev[selectedTicket._id] || []).map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        }));
      })
      .catch((err: Error) => {
        setMessagesByTicket((prev) => ({
          ...prev,
          [selectedTicket._id]: (prev[selectedTicket._id] || []).map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "failed" } : msg,
          ),
        }));

        setMessageQueue((prev) => [...prev, { ...newMessage, status: "pending" }]);
        toast.error(`Send Failed: ${err.message || "Could not send message."}`);
      });
  };

  useEffect(() => {
    const processQueue = async () => {
      if (!selectedTicket || messageQueue.length === 0 || isSendingRef.current) {
        return;
      }
      if (!canCurrentUserChat) {
        return;
      }

      const nextMessage = messageQueue[0];
      isSendingRef.current = true;

      const backendTicketId = selectedTicket._id || selectedTicket.ticketId;
      const destinationPhone = (selectedTicket.phone || "").trim();
      const res = destinationPhone
        ? await sendTicketMessage(
            backendTicketId,
            destinationPhone,
            nextMessage.message,
            currentUserEmail,
            selectedTicket.source,
            selectedTicket.senderId
          )
        : { success: false };

      setMessagesByTicket((prev) => ({
        ...prev,
        [selectedTicket._id]: (prev[selectedTicket._id] || []).map((msg) =>
          msg.id === nextMessage.id ? { ...msg, status: res.success ? "sent" : "failed" } : msg,
        ),
      }));

      setMessageQueue((prev) => prev.slice(1));
      isSendingRef.current = false;
    };

    void processQueue();
  }, [messageQueue, selectedTicket?._id, selectedTicket?.ticketId, selectedTicket?.phone, currentUserEmail, canCurrentUserChat]);

  const retryMessage = (message: Message) => {
    if (!selectedTicket) {
      return;
    }

    setMessagesByTicket((prev) => ({
      ...prev,
      [selectedTicket._id]: (prev[selectedTicket._id] || []).map((msg) =>
        msg.id === message.id ? { ...msg, status: "pending" } : msg,
      ),
    }));
    setMessageQueue((prev) => [message, ...prev]);
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setAttachedFile(file);
  };

  return (
<div className="flex flex-col h-full min-h-0 overflow-hidden">
  {!selectedTicket ? (
    <div className="flex flex-col items-center justify-center flex-1 text-[#818690]">
      <SearchOffOutlinedIcon className="text-[5.375rem] text-[#b8bbc1]" />
      <h4 className="mt-3 font-semibold text-[#1e2025]">
        No Tickets selected
      </h4>
      <p className="mt-1">Lorem ipsum dolor sit amet, consectet</p>
    </div>
  ) : (
    <>
      {/* Header */}
      <div className="h-[4.625rem] border-b border-[#d8dbe2] px-[1.125rem] flex items-center justify-between">
        <div className="flex items-center gap-[0.625rem]">
          <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-[#d4d5d8] flex items-center justify-center text-[0.8125rem] font-semibold">
            {selectedTicket.name?.charAt(0)?.toUpperCase() || "N"}
          </div>
          <div>
            <p className="font-semibold text-[0.875rem] text-[#1f2228]">
              {selectedTicket.name || "Name ABCD"}
            </p>
            <p className="text-[0.6875rem] text-[#8a8f99]">
              {formatTicketTime(selectedTicket.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-[1.125rem] pt-[0.875rem] pb-[0.5rem]"
      >
        {formattedMessages.length === 0 ? (
          <div className="h-[4.75rem] rounded-[0.5rem] bg-[#f7f7f8] mt-[0.875rem]" />
        ) : (
          formattedMessages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-[1.125rem] items-start gap-2 ${
                message.sender === "me" ? "justify-end" : ""
              }`}
            >
              {message.sender === "other" && (
                <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-[#e9d5b5] flex items-center justify-center mt-[0.375rem]" />
              )}

              <div className="max-w-[70%]">
                {/* Meta */}
                {message.sender !== "me" && (
                  <div className="mb-[0.375rem]">
                    <p className="text-[#2f333c] text-[1rem] font-medium leading-[1.1]">
                      {(message).sender ||
                        selectedTicket?.name ||
                        "WhatsApp User"}
                    </p>
                    <p className="text-[#838998] text-[0.75rem]">
                      {(message).time || message.time}
                    </p>
                  </div>
                )}

                {/* Message Box */}
                <div
                  className={`w-fit max-w-full rounded-[0.625rem] px-[0.625rem] py-[0.5rem] border ${
                    message.sender === "me"
                      ? "bg-[#dfe4f6] border-[#dfe4f6]"
                      : "bg-white border-[#e4e6ec]"
                  }`}
                >
                  <p className="text-[#2f333c] text-[0.8125rem] whitespace-pre-wrap break-words">
                    {message.message}
                  </p>

                  {message.attachmentName && (
                    <p className="mt-[4px] text-[12px] opacity-90">
                      <AttachFileOutlinedIcon fontSize="inherit" />{" "}
                      {message.attachmentName}
                    </p>
                  )}
                </div>

                {/* Status */}
                {message.sender === "me" &&
                  message.status &&
                  message.status !== "sent" && (
                    <span className="block mt-[0.125rem] text-[0.6875rem] text-[#9298a3] text-right">
                      ({message.status})
                    </span>
                  )}

                {message.sender === "me" &&
                  message.status === "failed" && (
                    <button
                      type="button"
                      onClick={() => retryMessage(message)}
                    >
                      <ReplayOutlinedIcon fontSize="small" />
                    </button>
                  )}
              </div>
            </div>
          ))
        )}

        {/* Closed Ticket */}
        {isClosedTicket && (
          <div className="mx-auto mt-4 mb-2 max-w-[38.75rem] w-full border border-[#e1e4eb] rounded-[0.625rem] bg-white px-[1.25rem] py-[1rem] text-center">
            <div className="w-[1.875rem] h-[1.875rem] mx-auto mb-2 rounded-full flex items-center justify-center bg-[#ffe3e3] text-[#ef4b4b]">
              <WorkOutlineOutlinedIcon fontSize="small" />
            </div>
            <h4 className="text-[1.25rem] font-semibold text-[#2f333c]">
              Ticket Closed
            </h4>
            <p className="text-[0.8125rem] text-[#7e8592]">
              {closedTicketNote}
            </p>
          </div>
        )}

        {/* Restricted */}
        {!isClosedTicket && !canCurrentUserChat && (
          <div className="mx-auto mt-4 mb-2 max-w-[38.75rem] w-full border border-[#f2d5a4] border-l-[0.25rem] border-l-[#d38a1f] rounded-[0.625rem] bg-[#fff8ea] text-[#805d1f] text-[0.8125rem] font-medium px-[0.875rem] py-[0.625rem] shadow-sm">
            {hasAssignedAgents
              ? "Only assigned users can chat on this ticket."
              : "No agent is assigned to this ticket yet. Please assign an agent to start chatting."}
          </div>
        )}
      </div>
    </>
  )}

  {/* Footer */}
  {selectedTicket && !isClosedTicket && canCurrentUserChat && (
    <div className="px-[1.125rem] pt-[0.75rem] pb-[1.125rem]">
      {attachedFile && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 border border-[#d9d9d9] rounded-[8px] w-fit max-w-full">
          <AttachFileOutlinedIcon fontSize="small" />
          <span className="truncate">{attachedFile.name}</span>
          <button
            onClick={() => {
              setAttachedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>
      )}

      <div className="relative">
        <input
          className="w-full h-[2.625rem] rounded-[0.625rem] border border-[#d6dae4] pl-[0.875rem] pr-[5.375rem] bg-white text-[0.8125rem] shadow-sm outline-none"
          placeholder="Type Your Message here....."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />

        <div className="absolute right-[0.625rem] top-1/2 -translate-y-1/2 flex items-center gap-[0.625rem] text-[#626977]">
          <button onClick={() => fileInputRef.current?.click()}>
            <AttachFileOutlinedIcon fontSize="small" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachFile}
          />

          <button
            className="w-[1.625rem] h-[1.625rem] rounded-full bg-[#4f79ff] text-white flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <SendRoundedIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default TicketInbox;
