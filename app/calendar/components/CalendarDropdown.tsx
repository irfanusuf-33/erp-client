"use client";
import moment from "moment";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { CalendarDropdownProps } from "@/types/calendar.types";

export default function CalendarDropdown({ selectedYear, selectedMonth, setDate, setSelectedDate, setSelectedYear, setSelectedMonth, setIsCalendarModalOpen, showWeekNumbers, selectedDate }: CalendarDropdownProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    setDate(newDate); setSelectedDate(newDate); setIsCalendarModalOpen(false);
  };

  const renderCalendar = () => {
    const dim = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const daysInPrev = getDaysInMonth(prevYear, prevMonth);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;
    const weeks: { weekNumber: number; days: React.ReactNode[] }[] = [];
    let currentWeek: React.ReactNode[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      currentWeek.push(<div key={`p${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-xs text-gray-300">{daysInPrev - i}</div>);
    }
    for (let day = 1; day <= dim; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const isSel = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === selectedMonth && selectedDate.getFullYear() === selectedYear;
      const highlight = isSel || (!selectedDate && isToday);
      currentWeek.push(
        <div key={day} className={`w-[30px] h-[30px] flex items-center justify-center text-xs cursor-pointer rounded-lg transition-all ${highlight ? "bg-blue-500 text-white font-semibold" : isToday ? "text-blue-600 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800" : "text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"}`} onClick={() => handleDateClick(day)}>{day}</div>
      );
      if (currentWeek.length === 7) {
        const wn = moment(new Date(selectedYear, selectedMonth, day)).week();
        weeks.push({ weekNumber: wn, days: currentWeek }); currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(<div key={`e${currentWeek.length}`} className="w-[30px] h-[30px]" />);
      weeks.push({ weekNumber: moment(new Date(selectedYear, selectedMonth, dim)).week(), days: currentWeek });
    }
    return weeks;
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-[300] bg-white dark:bg-zinc-900 border border-gray-900 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden min-w-[550px] h-[350px]" onClick={(e) => e.stopPropagation()}>
      <div className="flex h-full">
        <div className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <span className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{months[selectedMonth]} {selectedYear}</span>
            <div className="flex flex-col ml-4">
              <button className="text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 p-0.5" onClick={(e) => { e.stopPropagation(); selectedMonth === 0 ? (setSelectedMonth(11), setSelectedYear(selectedYear - 1)) : setSelectedMonth(selectedMonth - 1); }}><ChevronUp size={14} /></button>
              <button className="text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 p-0.5" onClick={(e) => { e.stopPropagation(); selectedMonth === 11 ? (setSelectedMonth(0), setSelectedYear(selectedYear + 1)) : setSelectedMonth(selectedMonth + 1); }}><ChevronDown size={14} /></button>
            </div>
          </div>
          <div className={`grid mb-4 ${showWeekNumbers ? "grid-cols-[30px_repeat(7,1fr)]" : "grid-cols-7"}`}>
            {showWeekNumbers && <div className="w-[30px]" />}
            {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="text-center text-xs font-semibold text-gray-700 dark:text-zinc-300 py-3 flex-1">{d}</div>)}
          </div>
          <div className="flex flex-col gap-0.5">
            {renderCalendar().map((week, idx) => (
              <div key={idx} className="flex items-center">
                {showWeekNumbers && <div className="w-[30px] h-[30px] flex items-center justify-center text-[11px] text-gray-500 font-semibold border-r border-b border-gray-200">{week.weekNumber}</div>}
                {week.days}
              </div>
            ))}
          </div>
        </div>
        <div className="w-px bg-gray-200 dark:bg-zinc-700 my-5" />
        <div className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <span className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{selectedYear}</span>
            <div className="flex flex-col ml-4">
              <button className="text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 p-0.5" onClick={(e) => { e.stopPropagation(); setSelectedYear(selectedYear - 1); }}><ChevronUp size={14} /></button>
              <button className="text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 p-0.5" onClick={(e) => { e.stopPropagation(); setSelectedYear(selectedYear + 1); }}><ChevronDown size={14} /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {years.map((year) => (
              <div key={year} className={`py-4 px-5 text-center text-xs font-semibold rounded-lg cursor-pointer transition-all ${year === selectedYear ? "bg-blue-500 text-white" : "text-gray-900 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"}`} onClick={(e) => { e.stopPropagation(); setSelectedYear(year); }}>{year}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
