"use client";

interface Props {
  isOpen: boolean; onClose: () => void;
  firstDayOfWeek: string; timeScale: string; showWeekNumbers: boolean;
  onFirstDayOfWeekChange: (v: string) => void;
  onTimeScaleChange: (v: string) => void;
  onShowWeekNumbersChange: (v: boolean) => void;
}

export default function CalendarSettingsModal({ isOpen, onClose, firstDayOfWeek, timeScale, showWeekNumbers, onFirstDayOfWeekChange, onTimeScaleChange, onShowWeekNumbersChange }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[500] flex items-center justify-center" onClick={onClose}>
      <div className="flex bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden w-[900px] max-w-[95vw] h-[600px] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Sidebar */}
        <div className="w-[280px] bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 py-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100 mb-6 px-6">Calendar Settings</h2>
          <div className="px-0">
            <div className="px-6 py-3 text-sm text-blue-600 font-medium border-l-[3px] border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer">View</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100">View</h1>
            <button className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 w-8 h-8 flex items-center justify-center rounded" onClick={onClose}>×</button>
          </div>

          <div className="flex-1 px-8 py-8 overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-800 dark:text-zinc-100 mb-5">Calendar appearance</h3>

            <div className="mb-5">
              <label className="block text-sm text-gray-700 dark:text-zinc-300 font-medium mb-2">Show the first day of the week as:</label>
              <select value={firstDayOfWeek} onChange={(e) => onFirstDayOfWeekChange(e.target.value)} className="w-full max-w-[400px] px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600">
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-700 dark:text-zinc-300 font-medium mb-2">Time scale:</label>
              <select value={timeScale} onChange={(e) => onTimeScaleChange(e.target.value)} className="w-full max-w-[400px] px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600">
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="60 minutes">60 minutes</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={showWeekNumbers} onChange={(e) => onShowWeekNumbersChange(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                Show week numbers
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-200 dark:border-zinc-800">
            <button className="px-5 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={onClose}>Discard</button>
            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors" onClick={onClose}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
