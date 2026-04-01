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
    <div className="border-r border-[#d8dbe2] bg-[#f4f5f7] h-full min-h-0 overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="p-[0.625rem] border-b border-[#d8dbe2]">
        
        {/* SEARCH */}
        <div className="flex items-center gap-2 bg-white border border-[#c8ccd6] rounded-lg px-[0.625rem]">
          <SearchIcon className="text-[#979ba6]" fontSize="small" />

          <input
            type="text"
            placeholder="Search Tickets...."
            className="border-0 bg-transparent h-[2.125rem] w-full outline-none text-[0.75rem]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="text-[#2563eb] flex items-center"
          >
            <FilterListIcon fontSize="small" />
          </button>
        </div>

        {/* FILTERS */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-[0.625rem]">
            
            <div className="flex items-center gap-[0.125rem] h-[1.625rem] px-[0.625rem] bg-white border border-[#c8ccd6] rounded-md text-[0.75rem] text-[#363a43]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-[0.125rem] h-[1.625rem] px-[0.625rem] bg-white border border-[#c8ccd6] rounded-md text-[0.75rem] text-[#363a43]">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1 h-[1.625rem] px-[0.625rem] bg-white border border-[#c8ccd6] rounded-md text-[0.75rem] text-[#363a43]">
              <span>All Departments</span>
              <ExpandMoreIcon fontSize="small" />
            </div>

          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto">
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-[#c7ccda] border-t-[#5a5f6e] rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="h-full min-h-[26.25rem] flex flex-col items-center justify-center text-center text-[#7b808a] p-6">
            <SearchOffOutlinedIcon className="text-[4.75rem] text-[#b5b8bd]" />
            <p className="mt-3 font-semibold text-[#1f2228]">No Tickets found</p>
            <p className="mt-1 text-[0.875rem]">Lorem ipsum dolor sit amet, consectet</p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => {
            const isSelected = ticket._id === selectedTicketId;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(isSelected ? null : ticket._id)}
                className={`w-full text-left border-b border-[#d8dbe2] min-h-[4.75rem] px-[0.625rem] py-2 flex items-start gap-[0.625rem] relative ${
                  isSelected ? "bg-[#e8ecf8]" : ""
                }`}
              >
                
                {/* LEFT ACTIVE BAR */}
                {isSelected && (
                  <span className="absolute left-0 top-2 bottom-2 w-[0.25rem] rounded bg-[#4f79ff]" />
                )}

                {/* AVATAR */}
                <div className="w-[2.125rem] h-[2.125rem] rounded-full bg-[#dfdfdf] flex items-center justify-center text-[#495264] font-semibold">
                  {ticket.name?.charAt(0)?.toUpperCase() || "N"}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  
                  <div className="font-semibold text-[0.875rem] text-[#1f2228]">
                    {ticket.name}
                  </div>

                  <div className="mt-[0.125rem] text-[0.75rem] text-[#8a8f99] truncate">
                    {ticket.description}
                  </div>

                  <div className="mt-[0.1875rem] flex items-center justify-between">
                    
                    <div className="text-[0.6875rem] text-[#4f79ff]">
                      #{ticket.ticketId}
                    </div>

                    <div className="flex items-center gap-[0.125rem] text-[0.625rem] text-[#ff3a3a]">
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
