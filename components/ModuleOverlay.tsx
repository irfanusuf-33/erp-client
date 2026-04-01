"use client";
import Link from "next/link";

interface ModuleItem {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

// Teal icon box matching the erp_view_cartridge icon-container style
function ModuleIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      {/* shadow rotated layer */}
      <div
        className="absolute rounded-lg"
        style={{
          left: "8px",
          bottom: "5px",
          width: "90%",
          height: "90%",
          backgroundColor: "#b2f0ec",
          transform: "rotate(20deg)",
          zIndex: 0,
        }}
      />
      {/* foreground teal box */}
      <div
        className="absolute inset-0 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "#2ec4b6", zIndex: 1 }}
      >
        {children}
      </div>
    </div>
  );
}

const modules: ModuleItem[] = [
  {
    title: "Identity and Access Management",
    description: "Ensure the right individuals have secure and appropriate access to the resources.",
    link: "/iam",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
      </svg>
    ),
  },
  {
    title: "Ticketing",
    description: "Organize support workflows with end-to-end ticket tracking, assignment, and resolution management.",
    link: "/ticketing",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      </svg>
    ),
  },
  {
    title: "Recruitment and Management",
    description: "Streamline the process of hiring, onboarding and track employee cycle.",
    link: "/hrm",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
  {
    title: "Time Sheet",
    description: "Track employee work hours, project time and productivity.",
    link: "/timesheet",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    title: "Client Relationship Management",
    description: "Manage and improve interaction with customers, streamline sales and improve customer service.",
    link: "/crm",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
  {
    title: "Efficiency Rate",
    description: "Measures employee productivity by analyzing task completion time, work output, and overall performance metrics.",
    link: "/efficiency",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Attendance and Leave Management",
    description: "Tracks employee attendance, leaves, and work hours.",
    link: "/attendance",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  {
    title: "Calendar",
    description: "Schedules meetings, deadlines, and events while integrating with employee tasks and availability.",
    link: "/calendar",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  {
    title: "Payroll Management",
    description: "Automates salary calculations, deductions, and payments.",
    link: "/payroll",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    title: "Task and Project Management",
    description: "Organizes, assigns, and tracks employee tasks and projects to ensure timely completion and productivity.",
    link: "/tasks",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Ecommerce",
    description: "Manages company-related purchases, employee discounts, and internal procurement processes.",
    link: "/ecommerce",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    ),
  },
  {
    title: "Help and Support",
    description: "Provides employees with a support system for any queries.",
    link: "/help-and-support",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    title: "Inventory Management",
    description: "The inventory management module tracks stock, optimizes allocation, and ensures accuracy.",
    link: "/inventory",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Human Resources Management",
    description: "Manages employee-related processes, including recruitment, onboarding, and performance tracking.",
    link: "/hrm",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
      </svg>
    ),
  },
  {
    title: "Settings",
    description: "Provides customization options for user roles, permissions, workflows, and system preferences.",
    link: "/settings",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
  {
    title: "Sales",
    description: "An integrated solution that automates and manages all stages of the sales process.",
    link: "/sales",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    title: "Analytics",
    description: "Provides insights into business performance through data visualization and reporting tools.",
    link: "/analytics",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1 0 20.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0 1 20.488 9z" />
      </svg>
    ),
  },
  {
    title: "Accounts",
    description: "Provides tools to manage user accounts, profile details, security settings, and authentication preferences.",
    link: "/accounts",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
];

interface ModuleOverlayProps {
  onClose: () => void;
}

export default function ModuleOverlay({ onClose }: ModuleOverlayProps) {
  return (
    // full-screen backdrop
    <div
      className="fixed inset-0 z-[9998] bg-black/20 dark:bg-black/40"
      onClick={onClose}
    >
      {/* dropdown panel — stop propagation so clicking inside doesn't close */}
      <div
        className="absolute left-0 right-0 bg-white dark:bg-zinc-900 border-t border-[#2ec4b6] dark:border-[#2ec4b6] overflow-y-auto"
        style={{ top: "64px", maxHeight: "calc(100vh - 64px)", boxShadow: "0 8px 32px rgba(46,196,182,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-12 py-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((mod, i) => (
                <Link
                  key={i}
                  href={mod.link}
                  onClick={onClose}
                  className="flex flex-col rounded p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e6faf8] dark:hover:bg-zinc-800 cursor-pointer no-underline"
                >
                  <div className="flex items-center gap-4">
                    <ModuleIcon>{mod.icon}</ModuleIcon>
                    <h3 className="text-[15px] font-semibold text-gray-800 dark:text-zinc-100 leading-snug">{mod.title}</h3>
                  </div>
                  <p className="mt-1 ml-[52px] text-sm text-gray-600 dark:text-zinc-400 leading-snug">{mod.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
