export interface TicketFormData {
  description: string;
  name: string;
  phone: string;
  priority: "high" | "medium" | "low";
  status: "Open" | "In Progress" | "Closed";
  dueDate: string;
}

export interface CreateTicketProps {
  ownerName?: string;
  ownerNumber?: string;
}

export type MessageStatus = "pending" | "sending" | "sent" | "failed";

export interface Message {
  id: string;
  ticketId?: string;
  ticketRaw?: unknown;
  source: string;
  message: string;
  sender: string;
  time: string;
  createdAt?: string;
  status?: MessageStatus;
  attachmentName?: string;
};

export interface Ticket {
  _id: string;
  name: string;
  ticketId: string;
  phone: string;
  description: string;
  status: string;
  agents: string[];
  createdAt?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  email?: string;
  source?: string;
  department?: string;
  senderId?: string;
  notes?: unknown;
  lastAgentDetail?: {
    _id?: string;
    email?: string;
    name?: string;
  };
}


export interface TicketListProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelect: (ticketId: string | null) => void;
  loading: boolean;
};

export interface TicketInboxProps {
  selectedTicket: Ticket | null;
  chats?: Message[];
}

export interface TicketDetailsProps {
  selectedTicket: Ticket | null;
  loading?: boolean;
  onTicketUpdate?: (ticketId: string, patch: Partial<Ticket>) => void;
};

export interface RecentTicketType {
  _id: string;
  ticketId: string;
  status: "Open" | "Closed" | "In Progress";
  priority: "low" | "medium" | "high";
  dueDate: string;
  agents: string[];
  lastAgentDetail: {
    _id: string;
    email: string;
  };
}

export interface PriorityCountsType {
  totalHighPriorityTickets: number;
  totalMediumPriorityTickets: number;
  totalLowPriorityTickets: number;
  openTickets: number;
};

export interface OverviewStatsType {
  totalTickets: number;
  overDueTickets: number;
  openTickets: number;
  onHoldTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  totalHighPriorityTickets: number;
  totalMediumPriorityTickets: number;
  totalLowPriorityTickets: number;
};


export interface TicketOverviewType {
  success: boolean;
  totalTickets: number;
  overDueTickets: number;
  openTickets: number;
  onHoldTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  totalHighPriorityTickets: number;
  totalMediumPriorityTickets: number;
  totalLowPriorityTickets: number;
  recentTickets: RecentTicketType[];
};

export interface TicketingOverviewSummaryProps {
  overview?: OverviewStatsType;
}

export interface TicketingPriorityChartProps {
  priorityCounts?: PriorityCountsType;
}

export interface TicketingTableProps {
  recentTickets?: RecentTicketType[];
}
