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
    <div className="ticketing-item ticket-message">
      {!selectedTicket ? (
        <div className="ticket-inbox-empty">
          <SearchOffOutlinedIcon className="empty-icon" />
          <h4>No Tickets selected</h4>
          <p>Lorem ipsum dolor sit amet, consectet</p>
        </div>
      ) : (
        <>
          <div className="message-header">
            <div className="user-head">
              <div className="avatar">{selectedTicket.name?.charAt(0)?.toUpperCase() || "N"}</div>
              <div>
                <p className="name">{selectedTicket.name || "Name ABCD"}</p>
                <p className="time">{formatTicketTime(selectedTicket.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="chat-scroll-container" ref={scrollContainerRef}>
            {formattedMessages.length === 0 ? (
              <div className="chat-placeholder"></div>
            ) : (
              formattedMessages.map((message) => (
                <div key={message.id} className={`message-row ${message.sender === "me" ? "me" : "other"}`}>
                  {message.sender === "other" && <div className="chat-avatar"></div>}
                  <div className="message-content" style={{ width: "fit-content", maxWidth: "70%" }}>
                    <div className="message-meta">
                      <p className="sender-name">
                        {message.sender === "other"
                          ? (message as any).senderName || selectedTicket?.name || "WhatsApp User"
                          : " "}
                      </p>
                      <p className="sender-time">{(message as any).displayTime || message.time}</p>
                    </div>
                    <div className="message-box" style={{ width: "fit-content", maxWidth: "100%" }}>
                      <p>{message.message}</p>
                      {message.attachmentName ? (
                        <p style={{ marginTop: "4px", fontSize: "12px", opacity: 0.9 }}>
                          <AttachFileOutlinedIcon fontSize="inherit" /> {message.attachmentName}
                        </p>
                      ) : null}
                    </div>
                    {message.sender === "me" && message.status && message.status !== "sent" ? (
                      <span>({message.status})</span>
                    ) : null}
                    {message.sender === "me" && message.status === "failed" ? (
                      <button type="button" className="retry-btn" onClick={() => retryMessage(message)}>
                        <ReplayOutlinedIcon fontSize="small" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}

            {isClosedTicket ? (
              <div className="ticket-closed-card">
                <div className="ticket-closed-icon">
                  <WorkOutlineOutlinedIcon fontSize="small" />
                </div>
                <h4>Ticket Closed</h4>
                <p>{closedTicketNote}</p>
              </div>
            ) : null}

            {!isClosedTicket && !canCurrentUserChat ? (
              <div className="ticket-chat-restricted">
                {hasAssignedAgents
                  ? "Only assigned users can chat on this ticket."
                  : "No agent is assigned to this ticket yet. Please assign an agent to start chatting."}
              </div>
            ) : null}
          </div>
        </>
      )}

      {selectedTicket && !isClosedTicket && canCurrentUserChat ? (
        <div className="message-footer">
          {attachedFile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                padding: "6px 10px",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                width: "fit-content",
                maxWidth: "100%",
              }}
            >
              <AttachFileOutlinedIcon fontSize="small" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachedFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setAttachedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                style={{ display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer" }}
                aria-label="Remove attached file"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>
          ) : null}
          <div className="message-input-wrap">
            <input
              className="message-input-field"
              placeholder="Type Your Message here....."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <div className="icons">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                aria-label="Attach file"
              >
                <AttachFileOutlinedIcon fontSize="small" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleAttachFile}
              />
              <button type="button" className="send-btn" onClick={handleSendMessage} aria-label="Send message">
                <SendRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TicketInbox;
