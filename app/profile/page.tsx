"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";

const tabs = ["Overview", "Contact", "Organization", "LinkedIn"];

export default function ProfilePage() {
  const router = useRouter();
  const user = useGlobalStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("Overview");
  const [message, setMessage] = useState("");
  const [showMoreContact, setShowMoreContact] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);

  const fullName = user
    ? `${user.fName || ""} ${user.lName || ""}`.trim() || user.username
    : "Guest User";

  const initials = user
    ? `${user.fName?.[0] ?? ""}${user.lName?.[0] ?? ""}`.toUpperCase() || user.username?.[0]?.toUpperCase() || "?"
    : "?";

  const email = user?.email ?? "user@voctrum.com";
  const username = user?.username ?? "user";

  // Dummy data for fields not in the User model
  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "09:05";

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="w-full bg-white dark:bg-slate-800 min-h-screen">

        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div className="flex items-start gap-5">
            {/* Avatar with status badge */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-2xl font-bold text-pink-600 dark:text-pink-400 select-none">
                {initials}
              </div>
              {/* Online/clock badge */}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-yellow-400 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
                </svg>
              </div>
            </div>

            {/* Name + action icons */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">{fullName}</h1>
              <div className="flex items-center gap-4">
                {/* LinkedIn */}
                <button className="text-blue-700 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 transition-colors" title="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button onClick={() => router.back()} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-8 py-6 space-y-6">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "Overview" && (
            <>
              {/* Quick message */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 rounded-lg px-4 py-3 border border-gray-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Send a quick message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-600 dark:text-slate-300 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
                <button className="text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* Status cards */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg divide-y divide-gray-100 dark:divide-slate-700">
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      Last seen {user?.lastLogin ? "recently" : "20 minutes ago"} • Free all day
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Work hours: 08:00 – 17:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{timeStr} – Same time zone as you</p>
                </div>
              </div>

              {/* Contact information */}
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-4">Contact information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Email</p>
                      <a href={`mailto:${email}`} className="text-sm text-blue-600 dark:text-blue-500 hover:underline">{email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Chat</p>
                      <a href="#" className="text-sm text-blue-600 dark:text-blue-500 hover:underline">{email}</a>
                    </div>
                  </div>
                </div>

                {showMoreContact && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Phone</p>
                        <span className="text-sm text-blue-600 dark:text-blue-500">+1 (555) 000-0000</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Location</p>
                        <span className="text-sm text-gray-700 dark:text-slate-300">Karachi, Pakistan</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowMoreContact((p) => !p)}
                  className="mt-4 text-sm text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {showMoreContact ? "Show less contact information" : "Show more contact information"}
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-700" />

              {/* LinkedIn section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-700 dark:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">LinkedIn</h2>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  I'm a web developer with a passion for crafting seamless digital experiences.{" "}
                  <span className="text-blue-600 dark:text-blue-500">I'm fluent in HTML, CSS, Javascript, C#, C / C++</span>
                  {" "}Crow, Node Js, ASP.NET Core and other related technologies
                </p>
                <button
                  onClick={() => setShowLinkedIn((p) => !p)}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {showLinkedIn ? "Hide LinkedIn profile" : "Show LinkedIn profile"}
                </button>
                {showLinkedIn && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-slate-400">LinkedIn profile URL not configured.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── CONTACT TAB ── */}
          {activeTab === "Contact" && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">Contact Details</h2>
              {[
                { label: "Email", value: email, icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
                { label: "Username", value: username, icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" },
                { label: "Phone", value: "+1 (555) 000-0000", icon: "M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                { label: "Location", value: "Karachi, Pakistan", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0zM15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
                { label: "Department", value: "Engineering", icon: "M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <svg className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
                    <p className="text-sm text-gray-800 dark:text-slate-200 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ORGANIZATION TAB ── */}
          {activeTab === "Organization" && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">Organization</h2>
              {[
                { label: "Company", value: "Voctrum" },
                { label: "Department", value: "Engineering" },
                { label: "Job Title", value: "Software Engineer" },
                { label: "Manager", value: "N/A" },
                { label: "Office", value: "Karachi HQ" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── LINKEDIN TAB ── */}
          {activeTab === "LinkedIn" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-700 dark:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">LinkedIn Profile</h2>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                I'm a web developer with a passion for crafting seamless digital experiences.{" "}
                <span className="text-blue-600 dark:text-blue-500">I'm fluent in HTML, CSS, Javascript, C#, C / C++</span>
                {" "}Crow, Node Js, ASP.NET Core and other related technologies.
              </p>
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 space-y-2">
                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide font-medium">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "C#", "ASP.NET"].map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              </div>
              <a href="#" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-500 hover:underline">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                View full LinkedIn profile
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
