import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo, useState } from "react";
import type { TicketListProps } from "../../../types/ticketing.types";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const formatTicketListTime = (value?: string) => {
  if (!value) {
    return "Now";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Now";
  }
  return parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const TicketList = ({ tickets, selectedTicketId, onSelect, loading }: TicketListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const ticketStatus = (ticket.status || "").toLowerCase();
      const normalizedStatus = ticketStatus === "onhold" ? "in progress" : ticketStatus;
      const ticketPriority = (ticket.priority || "").toLowerCase();

      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticketPriority === priorityFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (ticket.name || "").toLowerCase().includes(normalizedSearch) ||
        (ticket.ticketId || "").toLowerCase().includes(normalizedSearch) ||
        (ticket.description || "").toLowerCase().includes(normalizedSearch) ||
        (ticket.phone || "").toLowerCase().includes(normalizedSearch) ||
        (ticket.email || "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="ticketing-item ticket-list">
      <div className="ticket-list-header">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" fontSize="small" />
          <input
            type="text"
            placeholder="Search Tickets...."
            className="search-tickets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="filter-btn"
            aria-label="Filter tickets"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <FilterListIcon fontSize="small" />
          </button>
        </div>
        {showFilters && (
          <div className="filters-row">
            <div className="filter-select">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="filter-select">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="filter-select">
              <span>All Departments</span>
              <ExpandMoreIcon fontSize="small" />
            </div>
          </div>
        )}
      </div>
      <div className="ticket-list-content-wrapper">
        {loading ? (
          <div className="chat-loader-container">
            <div className="chat-loader"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="ticket-empty-state">
            <SearchOffOutlinedIcon className="ticket-empty-icon" />
            <p className="ticket-empty-title">No Tickets found</p>
            <p className="ticket-empty-text">Lorem ipsum dolor sit amet, consectet</p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => {
            const isSelected = ticket._id === selectedTicketId;
            return (
              <button
                type="button"
                key={index}
                className={`ticket-list-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(isSelected ? null : ticket._id)}
              >
                <div className="tag-container">
                  <div className="tag">{ticket.name?.charAt(0)?.toUpperCase() || "N"}</div>
                </div>
                <div className="ticket-meta">
                  <div className="title">{ticket.name}</div>
                  <div className="desc">{ticket.description}</div>
                  <div className="id-wrap">
                    <div className="id">#{ticket.ticketId}</div>
                    <div className="ticket-time">
                      <AccessTimeOutlinedIcon fontSize="inherit" />
                      <span>{formatTicketListTime(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TicketList;
