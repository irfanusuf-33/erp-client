import Image from "next/image";

export default function GlobalNavbar() {
  return (
    <div className="w-full h-14 bg-slate-500 flex items-center justify-between px-6">

      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center w-[58px] h-[39px]">
          <Image src="/Logo.png" alt="Voctrum" width={54} height={35} className="object-contain" />
        </div>

        <button type="button" aria-label="Open menu" className="text-white">
          <svg width="28" height="28" viewBox="0 0 30 30" fill="white">
            <rect x="1" y="1" width="8" height="8" rx="2" />
            <rect x="11" y="1" width="8" height="8" rx="2" />
            <rect x="21" y="1" width="8" height="8" rx="2" />
            <rect x="1" y="11" width="8" height="8" rx="2" />
            <rect x="11" y="11" width="8" height="8" rx="2" />
            <rect x="21" y="11" width="8" height="8" rx="2" />
            <rect x="1" y="21" width="8" height="8" rx="2" />
            <rect x="11" y="21" width="8" height="8" rx="2" />
            <rect x="21" y="21" width="8" height="8" rx="2" />
          </svg>
        </button>

        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-3 w-64 ml-3">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="text-gray-400 text-sm bg-transparent outline-none w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Notifications">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
          </svg>
        </button>

        <button type="button" aria-label="Messages">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        </button>

        <button type="button" aria-label="User menu" className="flex items-center gap-1">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-blue-600 text-sm font-bold">
            FA
          </div>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

    </div>
  );
}
