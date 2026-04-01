"use client";
import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { User, Clock, MapPin, FileText, ChevronLeft, ChevronRight, ChevronDown, ToggleLeft, ToggleRight } from "lucide-react";
import type { CalendarEvent, NewEventForm } from "@/types/calendar.types";
import { useGlobalStore } from "@/store";
import EventOverflowPopup from "./EventOverflowPopup";

interface Props {
  isOpen: boolean;
  selectedEvent: CalendarEvent | null;
  newEvent: NewEventForm;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onEventChange: (event: NewEventForm) => void;
  allEvents?: CalendarEvent[];
  selectedPlatform: string;
  setSelectedPlatform: (v: string) => void;
  meetingLink: string;
  setMeetingLink: (v: string) => void;
  handleGenerateLink: (event: NewEventForm) => Promise<string>;
  allDay: boolean;
  setAllDay: (v: boolean) => void;
}

export default function EventModal({
  isOpen, selectedEvent, newEvent, onClose, onSave, onEventChange,
  allEvents = [], selectedPlatform, setSelectedPlatform,
  handleGenerateLink, allDay, setAllDay,
}: Props) {
  if (!isOpen) return null;

  const { getAttendeesExceptMe, getUserDetails } = useGlobalStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allAttendees, setAllAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => newEvent.start ? new Date(newEvent.start) : new Date());
  const [overflowPopup, setOverflowPopup] = useState<{ isOpen: boolean; events: CalendarEvent[]; position: { x: number; y: number }; }>({ isOpen: false, events: [], position: { x: 0, y: 0 } });
  const [isCalDropdownOpen, setIsCalDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date(newEvent.start || new Date()).getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date(newEvent.start || new Date()).getMonth());
  const [meetingPlatformEnabled, setMeetingPlatformEnabled] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  // Attendee tooltip
  const [hoveredAttendee, setHoveredAttendee] = useState<{ email: string; x: number; y: number } | null>(null);
  const [hoveredUserDetails, setHoveredUserDetails] = useState<any>(null);
  const [loadingHoverDetails, setLoadingHoverDetails] = useState(false);

  useEffect(() => {
    if (newEvent.start) {
      const d = new Date(newEvent.start);
      setCurrentDate(d); setSelectedYear(d.getFullYear()); setSelectedMonth(d.getMonth());
    }
  }, [newEvent.start]);

  useEffect(() => {
    (async () => {
      setLoadingAttendees(true);
      try {
        const res = await getAttendeesExceptMe();
        setAllAttendees(res.success ? res.data || [] : []);
      } catch { setAllAttendees([]); }
      finally { setLoadingAttendees(false); }
    })();
  }, []);

  const dayEvents = useMemo(() =>
    allEvents.filter((e) => moment(e.start).isSame(moment(currentDate), "day")),
    [allEvents, currentDate]
  );
  const getEventsForHour = (hour: number) => dayEvents.filter((e) => moment(e.start).hour() === hour);

  const getAttendeeEmail = (a: any) => typeof a === "string" ? a : a?.userEmail || a?.email || "";

  const selectedEmails = useMemo(() => {
    const s = new Set<string>();
    (newEvent.inviteRequiredAttendees || []).forEach((a: any) => { const e = getAttendeeEmail(a); if (e) s.add(e); });
    return s;
  }, [newEvent.inviteRequiredAttendees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!val.trim()) { setSearchResults([]); return; }
    const filtered = allAttendees.filter((u) => {
      const name = `${u.fName || ""} ${u.lName || ""}`.toLowerCase();
      return name.includes(val.toLowerCase()) || (u.email || "").toLowerCase().includes(val.toLowerCase());
    }).slice(0, 8);
    setSearchResults(filtered);
  };

  const handleAddAttendee = (email: string) => {
    if (!selectedEmails.has(email)) {
      onEventChange({ ...newEvent, inviteRequiredAttendees: [...newEvent.inviteRequiredAttendees, email] });
    }
    setSearchTerm(""); setSearchResults([]);
  };

  const handleRemoveAttendee = (email: string) => {
    onEventChange({ ...newEvent, inviteRequiredAttendees: newEvent.inviteRequiredAttendees.filter((a: any) => getAttendeeEmail(a) !== email) });
  };

  const generate15MinSlots = () => {
    const times: string[] = [];
    for (let h = 0; h < 24; h++)
      for (let m = 0; m < 60; m += 15)
        times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    return times;
  };

  const isTimeInRange = (hour: number, isHalf: boolean) => {
    if (!newEvent.start || !newEvent.end) return false;
    const slotStart = moment(currentDate).hour(hour).minute(isHalf ? 30 : 0);
    const slotEnd = slotStart.clone().add(30, "minutes");
    return slotStart.isBefore(moment(newEvent.end)) && slotEnd.isAfter(moment(newEvent.start));
  };

  const handleTimeSlotClick = (hour: number, isHalf: boolean) => {
    const dt = moment(currentDate).hour(hour).minute(isHalf ? 30 : 0).second(0);
    onEventChange({ ...newEvent, start: dt.toISOString(), end: dt.clone().add(30, "minutes").toISOString() });
  };

  const changeDay = (days: number) => {
    const d = new Date(currentDate); d.setDate(d.getDate() + days); setCurrentDate(d);
  };

  const isValidEmail = (email: string) => {
    const t = email.trim();
    const at = t.indexOf("@");
    if (at <= 0 || at === t.length - 1) return false;
    const dot = t.lastIndexOf(".");
    return dot > at + 1 && dot < t.length - 1;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newEvent.title.trim()) errs.title = "Title is required";
    if (!newEvent.start) errs.start = "Start time is required";
    if (!newEvent.end) errs.end = "End time is required";
    if (newEvent.start && newEvent.end && new Date(newEvent.start) >= new Date(newEvent.end)) errs.end = "End must be after start";
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(); };

  const formatDate = (d: Date) => {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  };

  const generateTimeSlots = () =>
    Array.from({ length: 24 }, (_, i) => {
      if (i === 0) return { hour: i, label: "12 AM" };
      if (i < 12) return { hour: i, label: `${i} AM` };
      if (i === 12) return { hour: i, label: "12 PM" };
      return { hour: i, label: `${i - 12} PM` };
    });

  const colors = ["#E57373","#64B5F6","#81C784","#FFB74D","#BA68C8","#4DB6AC"];

  // ── Attendee tooltip state ──

  const getTimezoneOffset = (tz: string) => {    try {
      const date = new Date();
      const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
      const local = new Date(date.toLocaleString("en-US", { timeZone: tz }));
      const offset = (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
      const h = Math.floor(Math.abs(offset));
      const m = Math.abs((offset % 1) * 60);
      const sign = offset >= 0 ? "+" : "-";
      return `GMT${sign}${h}:${String(m).padStart(2, "0")}`;
    } catch { return tz; }
  };

  const getLocalTime = (tz: string) => {
    try {
      return new Date().toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: true });
    } catch { return ""; }
  };

  // ── Generate link fallback (client-side for Google Meet / Teams) ──
  const generateLinkFallback = (platform: string, title: string): string => {
    const encoded = encodeURIComponent(title || "Meeting");
    if (platform === "google") {
      // Google Meet links require OAuth — open Google Meet new meeting page
      return `https://meet.google.com/new`;
    }
    if (platform === "teams") {
      // Deep-link to Teams new meeting
      return `https://teams.microsoft.com/l/meeting/new?subject=${encoded}`;
    }
    if (platform === "zoom") {
      return `https://zoom.us/start/videomeeting`;
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/45 z-[400] flex items-center justify-center p-4" onClick={() => { if (!overflowPopup.isOpen) onClose(); }}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-[1200px] h-[700px] max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-4 z-10 w-8 h-8 flex items-center justify-center text-2xl text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors" onClick={onClose}>×</button>

        <div className="flex flex-1 overflow-hidden p-10 gap-6">
          {/* ── Left panel ── */}
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2" style={{ scrollbarWidth: "thin" }}>

            {/* Title + platform toggle */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 border-b border-gray-300 dark:border-zinc-800 pb-2">
                <div className="w-6 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-4">
                  <input
                    type="text"
                    className={`flex-1 border-none outline-none text-base text-gray-700 dark:text-zinc-100 bg-transparent placeholder-gray-400 ${validationErrors.title ? "placeholder-red-400" : ""}`}
                    value={newEvent.title}
                    onChange={(e) => { onEventChange({ ...newEvent, title: e.target.value }); if (validationErrors.title) setValidationErrors((p) => ({ ...p, title: "" })); }}
                    placeholder="Add a title"
                  />
                  <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setMeetingPlatformEnabled(!meetingPlatformEnabled)}>
                    {meetingPlatformEnabled ? <ToggleRight size={36} className="text-blue-600" /> : <ToggleLeft size={36} className="text-gray-300" />}
                    <span className="text-sm text-gray-600 dark:text-zinc-400 whitespace-nowrap">Meeting platform</span>
                  </div>
                </div>
              </div>
              {validationErrors.title && <span className="text-xs text-red-500 ml-9">{validationErrors.title}</span>}
            </div>

            {/* Meeting platform section */}
            {meetingPlatformEnabled && (
              <div className="ml-9 flex flex-col gap-2">
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded text-sm bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 outline-none" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                    <option value="google">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                  <button className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded text-sm bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                    onClick={async () => {
                      let link = await handleGenerateLink(newEvent);
                      // Fallback: generate client-side link if backend returns empty
                      if (!link) link = generateLinkFallback(selectedPlatform, newEvent.title);
                      if (link) onEventChange({ ...newEvent, meetingLink: link });
                    }}>
                    Generate Link
                  </button>
                </div>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded text-sm bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 outline-none" placeholder="Meeting link" value={newEvent.meetingLink} onChange={(e) => onEventChange({ ...newEvent, meetingLink: e.target.value })} />
              </div>
            )}

            {/* Attendees */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-3 relative">
                <User size={20} className="text-blue-600 mt-2 flex-shrink-0" />
                <div
                  className="flex-1 flex flex-wrap items-center gap-1.5 min-h-8 border-b border-gray-300 dark:border-zinc-800 pb-2 cursor-text focus-within:border-blue-600"
                  onClick={() => document.getElementById("attendeeInput")?.focus()}
                >
                  {newEvent.inviteRequiredAttendees.map((a: any, idx: number) => {
                    const email = getAttendeeEmail(a);
                    const u = allAttendees.find((x) => x.email === email);
                    const display = u ? `${u.fName || ""} ${u.lName || ""}`.trim() || email.split("@")[0] : email.split("@")[0];
                    const tz = u?.timezone?.timezone;
                    return (
                      <span
                        key={idx}
                        className="relative inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 rounded-xl text-xs text-gray-700 dark:text-zinc-100 cursor-default"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pos = { email, x: rect.left, y: rect.bottom + 6 };
                          setHoveredAttendee(pos);
                          setHoveredUserDetails(null);
                          // First use cached allAttendees data
                          const cached = allAttendees.find((x) => x.email === email);
                          if (cached) setHoveredUserDetails(cached);
                          // Then fetch full details from backend
                          setLoadingHoverDetails(true);
                          getUserDetails(email).then((res) => {
                            if (res.success && res.data) setHoveredUserDetails(res.data);
                          }).finally(() => setLoadingHoverDetails(false));
                        }}
                        onMouseLeave={() => { setHoveredAttendee(null); setHoveredUserDetails(null); }}
                      >
                        {display}
                        <button type="button" className="text-gray-400 hover:text-red-500 text-sm leading-none" onClick={() => handleRemoveAttendee(email)}>×</button>
                      </span>
                    );
                  })}
                  <input id="attendeeInput" type="text" className="flex-1 min-w-[150px] border-none outline-none text-sm text-gray-700 dark:text-zinc-100 bg-transparent placeholder-gray-400 py-1" placeholder={newEvent.inviteRequiredAttendees.length === 0 ? "Invite required attendees" : ""} value={searchTerm} onChange={handleSearchChange} />
                  {loadingAttendees && <span className="text-xs text-gray-400">...</span>}
                </div>

                {(searchResults.length > 0 || (searchTerm && searchTerm.includes("@"))) && (
                  <div className="absolute top-full left-9 right-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 max-h-[260px] overflow-y-auto py-2">
                    {searchResults.length > 0 && <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-4 mb-1.5">Suggested contacts</p>}
                    <ul className="list-none p-0 m-0">
                      {searchResults.map((u, idx) => {
                        const isSel = selectedEmails.has(u.email);
                        return (
                          <li key={idx} className={`flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${isSel ? "opacity-50 pointer-events-none" : ""}`} onClick={() => !isSel && handleAddAttendee(u.email)}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}>{(u.fName?.[0] || u.email?.[0] || "?").toUpperCase()}</div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-700 dark:text-zinc-100">{`${u.fName || ""} ${u.lName || ""}`.trim() || "Unknown"}</span>
                              <span className="text-xs text-gray-500">{u.email}</span>
                            </div>
                          </li>
                        );
                      })}
                      {searchResults.length === 0 && searchTerm.includes("@") && (
                        isValidEmail(searchTerm) ? (
                          <li className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800" onClick={() => handleAddAttendee(searchTerm)}>
                            <div className="flex flex-col"><span className="text-sm font-semibold text-gray-700 dark:text-zinc-100">Add &ldquo;{searchTerm}&rdquo;</span><span className="text-xs text-gray-500">No user found, add anyway</span></div>
                          </li>
                        ) : (
                          <li className="px-4 py-2 text-sm text-gray-400">Invalid email format</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Date / Time */}
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-blue-600 mt-2 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-3">
                {/* Start row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <input type="date" className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-700 dark:text-zinc-100 bg-white dark:bg-zinc-800 outline-none focus:border-blue-600 w-[180px]"
                    value={moment(newEvent.start).local().format("YYYY-MM-DD")}
                    onChange={(e) => { const t = moment(newEvent.start).local().format("HH:mm"); onEventChange({ ...newEvent, start: moment(`${e.target.value}T${t}`).toISOString() }); }} />
                  {!allDay && (
                    <div className="relative">
                      <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
                        <input type="text" className="px-3 py-2 text-sm text-gray-700 dark:text-zinc-100 bg-transparent outline-none w-[90px]"
                          value={moment(newEvent.start).local().format("HH:mm")}
                          onChange={(e) => { const d = moment(newEvent.start).local().format("YYYY-MM-DD"); onEventChange({ ...newEvent, start: moment(`${d}T${e.target.value}`).toISOString() }); }}
                          onFocus={() => setIsStartTimeOpen(true)} placeholder="HH:MM" />
                        <ChevronDown size={14} className="text-gray-400 mr-2 cursor-pointer" onClick={() => setIsStartTimeOpen(!isStartTimeOpen)} />
                      </div>
                      {isStartTimeOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-lg z-50 max-h-[180px] overflow-y-auto w-[100px]" style={{ scrollbarWidth: "thin" }}>
                          {generate15MinSlots().map((t) => (
                            <div key={t} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${moment(newEvent.start).local().format("HH:mm") === t ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold" : "text-gray-700 dark:text-zinc-100"}`}
                              onClick={() => { const d = moment(newEvent.start).local().format("YYYY-MM-DD"); onEventChange({ ...newEvent, start: moment(`${d}T${t}`).toISOString() }); setIsStartTimeOpen(false); }}>{t}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 cursor-pointer ml-auto" onClick={() => { setAllDay(!allDay); onEventChange({ ...newEvent, allDay: !allDay }); }}>
                    {allDay ? <ToggleRight size={36} className="text-blue-600" /> : <ToggleLeft size={36} className="text-gray-300" />}
                    <span className="text-sm text-gray-600 dark:text-zinc-400 whitespace-nowrap">Full day</span>
                  </div>
                </div>
                {/* End row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <input type="date" className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-700 dark:text-zinc-100 bg-white dark:bg-zinc-800 outline-none focus:border-blue-600 w-[180px]"
                    value={moment(newEvent.end).local().format("YYYY-MM-DD")}
                    onChange={(e) => { const t = moment(newEvent.end).local().format("HH:mm"); onEventChange({ ...newEvent, end: moment(`${e.target.value}T${t}`).toISOString() }); }} />
                  {!allDay && (
                    <div className="relative">
                      <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
                        <input type="text" className="px-3 py-2 text-sm text-gray-700 dark:text-zinc-100 bg-transparent outline-none w-[90px]"
                          value={moment(newEvent.end).local().format("HH:mm")}
                          onChange={(e) => { const d = moment(newEvent.end).local().format("YYYY-MM-DD"); onEventChange({ ...newEvent, end: moment(`${d}T${e.target.value}`).toISOString() }); }}
                          onFocus={() => setIsEndTimeOpen(true)} placeholder="HH:MM" />
                        <ChevronDown size={14} className="text-gray-400 mr-2 cursor-pointer" onClick={() => setIsEndTimeOpen(!isEndTimeOpen)} />
                      </div>
                      {isEndTimeOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-lg z-50 max-h-[180px] overflow-y-auto w-[100px]" style={{ scrollbarWidth: "thin" }}>
                          {generate15MinSlots().map((t) => (
                            <div key={t} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${moment(newEvent.end).local().format("HH:mm") === t ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold" : "text-gray-700 dark:text-zinc-100"}`}
                              onClick={() => { const d = moment(newEvent.end).local().format("YYYY-MM-DD"); onEventChange({ ...newEvent, end: moment(`${d}T${t}`).toISOString() }); setIsEndTimeOpen(false); }}>{t}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {(validationErrors.start || validationErrors.end) && <span className="text-xs text-red-500">{validationErrors.end || validationErrors.start}</span>}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-blue-600 flex-shrink-0" />
              <input type="text" className="flex-1 border-none border-b border-gray-300 dark:border-zinc-800 outline-none text-sm text-gray-700 dark:text-zinc-100 bg-transparent placeholder-gray-400 py-2 focus:border-b-blue-600"
                value={newEvent.location} onChange={(e) => onEventChange({ ...newEvent, location: e.target.value })} placeholder="Add Room or Location" />
            </div>

            {/* Description + attachments */}
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-blue-600 mt-2 flex-shrink-0" />
              <div className="flex-1 flex flex-col border border-gray-200 dark:border-zinc-800 rounded overflow-hidden">
                <textarea className="flex-1 border-none outline-none text-sm text-gray-700 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder-gray-400 p-3 resize-none min-h-[100px]"
                  value={newEvent.description} onChange={(e) => onEventChange({ ...newEvent, description: e.target.value })} placeholder="Add description" rows={3} />
                <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
                  <label className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" htmlFor="evt-file-input">📎 Attach file</label>
                  <input id="evt-file-input" type="file" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []) as File[]; if (files.length) { setAttachedFiles((p) => [...p, ...files]); onEventChange({ ...newEvent, attachments: [...(newEvent.attachments || []), ...files] }); } }} />
                </div>
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs text-gray-700 dark:text-zinc-100">
                        <span>{f.name}</span>
                        <button className="text-gray-400 hover:text-red-500 text-sm" onClick={() => { const nf = attachedFiles.filter((_, j) => j !== i); setAttachedFiles(nf); onEventChange({ ...newEvent, attachments: nf }); }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right panel: mini day view ── */}
          <div className="w-[380px] flex-shrink-0 flex flex-col border border-gray-300 dark:border-zinc-800 rounded-lg overflow-hidden">
            {/* Mini cal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors" onClick={() => changeDay(-1)}><ChevronLeft size={16} /></button>
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors" onClick={() => changeDay(1)}><ChevronRight size={16} /></button>
              <div className="flex-1 relative">
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-zinc-100 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" onClick={(e) => { e.stopPropagation(); setIsCalDropdownOpen(!isCalDropdownOpen); }}>
                  {formatDate(currentDate)}<ChevronDown size={14} className="text-gray-400" />
                </div>
                {isCalDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-3 w-[240px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3 text-sm font-semibold text-gray-700 dark:text-zinc-100">
                      <button className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setSelectedMonth(selectedMonth === 0 ? 11 : selectedMonth - 1)}>←</button>
                      <span>{moment().month(selectedMonth).format("MMMM")} {selectedYear}</span>
                      <button className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setSelectedMonth(selectedMonth === 11 ? 0 : selectedMonth + 1)}>→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
                      {(() => {
                        const dim = moment([selectedYear, selectedMonth]).daysInMonth();
                        const fd = moment([selectedYear, selectedMonth, 1]).day();
                        const cells = [];
                        for (let i = 0; i < fd; i++) cells.push(<div key={`e${i}`} />);
                        for (let d = 1; d <= dim; d++) {
                          const isSel = moment(currentDate).date() === d && moment(currentDate).month() === selectedMonth && moment(currentDate).year() === selectedYear;
                          cells.push(<div key={d} className={`text-center text-xs py-1.5 rounded cursor-pointer transition-colors ${isSel ? "bg-blue-500 text-white font-semibold" : "text-gray-700 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                            onClick={() => { const nd = moment([selectedYear, selectedMonth, d]).toDate(); setCurrentDate(nd); const t = moment(newEvent.start).local().format("HH:mm"); onEventChange({ ...newEvent, start: moment(`${moment(nd).format("YYYY-MM-DD")}T${t}`).toISOString() }); setIsCalDropdownOpen(false); }}>{d}</div>);
                        }
                        return cells;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mini time grid */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900" style={{ scrollbarWidth: "thin" }}>
              {generateTimeSlots().map(({ hour, label }) => (
                <div key={hour} className="relative border-b border-gray-100 dark:border-zinc-800">
                  {/* Top half */}
                  <div className={`flex items-start min-h-[25px] cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${isTimeInRange(hour, false) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`} onClick={() => handleTimeSlotClick(hour, false)}>
                    <span className="w-[50px] text-[11px] text-gray-400 text-right pr-2 pt-1 flex-shrink-0">{label}</span>
                    <div className="flex-1 border-l border-gray-200 dark:border-zinc-800 min-h-[25px]" />
                  </div>
                  {/* Bottom half */}
                  <div className={`flex items-start min-h-[25px] cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 border-t border-dashed border-gray-200 dark:border-zinc-800 ${isTimeInRange(hour, true) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`} onClick={() => handleTimeSlotClick(hour, true)}>
                    <div className="w-[50px] flex-shrink-0" />
                    <div className="flex-1 border-l border-gray-200 dark:border-zinc-800 min-h-[25px]" />
                  </div>
                  {/* Mini events */}
                  {(() => {
                    const hourEvts = getEventsForHour(hour);
                    if (!hourEvts.length) return null;
                    const visible = hourEvts[0];
                    const es = moment(visible.start), ee = moment(visible.end);
                    const topPct = (es.minute() / 60) * 100;
                    const heightPct = Math.max((ee.diff(es, "minutes") / 60) * 100, 8);
                    const isCurrent = selectedEvent?.id === visible.id;
                    const remaining = hourEvts.length - 1;
                    return (
                      <>
                        <div className={`absolute left-[52px] right-1 rounded text-[10px] text-white font-semibold overflow-hidden pointer-events-none px-1 py-0.5 ${isCurrent ? "bg-blue-700 border-l-2 border-amber-400" : "bg-blue-500 border-l-2 border-blue-600"}`}
                          style={{ top: `${topPct}%`, height: `${heightPct}%` }}>
                          <span className="block truncate">{visible.title}</span>
                        </div>
                        {remaining > 0 && (
                          <div className="absolute right-1 w-11 h-[18px] bg-gray-500 text-white rounded text-[9px] font-semibold flex items-center justify-center z-10 cursor-pointer"
                            style={{ top: `${topPct}%` }}
                            onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setOverflowPopup({ isOpen: true, events: hourEvts.slice(1), position: { x: rect.left - 268, y: rect.bottom + 5 } }); }}>
                            +{remaining}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <button className="px-5 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={onClose}>Discard</button>
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* ── Attendee hover tooltip ── */}
      {hoveredAttendee && (() => {
        const u = hoveredUserDetails;
        const tz = u?.timezone?.timezone || u?.timezone || u?.userTimezone || null;
        const tzOffset = tz ? getTimezoneOffset(tz) : null;
        const localTime = tz ? getLocalTime(tz) : null;
        const name = u
          ? (`${u.fName || u.firstName || ""} ${u.lName || u.lastName || ""}`).trim() || hoveredAttendee.email.split("@")[0]
          : hoveredAttendee.email.split("@")[0];
        const initials = (name[0] || hoveredAttendee.email[0] || "?").toUpperCase();
        const isActive = u ? !u.disabled : null;
        return (
          <div
            className="fixed z-[9999] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl p-4 w-64 pointer-events-none"
            style={{ left: Math.min(hoveredAttendee.x, window.innerWidth - 280), top: hoveredAttendee.y }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{initials}</div>
                {isActive !== null && <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-800 ${isActive ? "bg-green-500" : "bg-zinc-500"}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">{name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{hoveredAttendee.email}</p>
              </div>
            </div>
            {loadingHoverDetails && !u && <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-1">Loading...</p>}
            <div className="border-t border-gray-100 dark:border-zinc-700 pt-3 space-y-2">
              {isActive !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Status</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isActive ? "text-green-600 dark:text-green-400" : "text-zinc-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-zinc-500"}`} />
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
              {localTime && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Local time</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-100">{localTime}</span>
                </div>
              )}
              {tzOffset && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Timezone</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-100">{tzOffset}</span>
                </div>
              )}
              {tz && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Region</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-zinc-300 truncate max-w-[130px] text-right">{tz}</span>
                </div>
              )}
              {(u?.role || u?.userRole) && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Role</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-zinc-300 capitalize">{u.role || u.userRole}</span>
                </div>
              )}
              {!tz && !loadingHoverDetails && u && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 text-center">No timezone info available</p>
              )}
            </div>
          </div>
        );
      })()}

      <EventOverflowPopup
        isOpen={overflowPopup.isOpen} events={overflowPopup.events} position={overflowPopup.position}
        onClose={() => setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } })}
        onEventClick={(event) => { const es = moment(event.start), ee = moment(event.end); onEventChange({ ...newEvent, title: event.title, start: es.toISOString(), end: ee.toISOString(), description: event.description || "" }); setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } }); }}
      />
    </div>
  );
}
