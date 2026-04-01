"use client";
import Link from "next/link";
import { useRef } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Products",
    links: [
      { title: "Create Product", href: "/inventory/product/create" },
      { title: "Product List", href: "/inventory/product/productList" },
    ],
  },
  {
    label: "Templates",
    links: [
      { title: "Template List", href: "/inventory/product/templates" },
      { title: "Create Template", href: "/inventory/product/templates/create" },
    ],
  },
  {
    label: "Categories",
    links: [
      { title: "Category List", href: "/inventory/category/list" },
      { title: "Create Category", href: "/inventory/category/create" },
    ],
  },
  {
    label: "Warehouses",
    links: [
      { title: "Warehouse List", href: "/inventory/warehouse/list" },
      { title: "Create Warehouse", href: "/inventory/warehouse/create" },
    ],
  },
];

function DropdownItem({ item }: { item: (typeof navItems)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = item.links.some((l) => pathname.startsWith(l.href));

  return (
    <div ref={ref} className="relative h-full flex items-center group">
      <button
        type="button"
        className={`flex items-center gap-1 text-xs px-6 h-full font-semibold transition-colors border-t-4
          ${isActive
            ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "text-gray-700 dark:text-zinc-100 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          }`}
      >
        {item.label}
        <span className={`text-[14px] ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`}>▾</span>
      </button>

      <div className="absolute top-full left-0 z-50 hidden group-hover:block pt-0.5">
        <div className="bg-white dark:bg-zinc-900 rounded-lg min-w-[180px] py-2 mt-0" style={{ boxShadow: "0 4px 20px rgba(43, 127, 255, 0.35)" }}>
          {item.links.map((link) => (
            <div key={link.href} className="relative group/item">
              <span className="absolute left-2 top-3 bottom-3 w-0.5 bg-transparent group-hover/item:bg-blue-600 dark:group-hover/item:bg-blue-400" />
              <Link
                href={link.href}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-100 font-medium hover:text-blue-600 dark:hover:text-blue-400"
              >
                {link.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InventoryNavbar() {
  return (
    <div className="h-12 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center px-5 shrink-0">
      <div className="flex items-center gap-3 mr-6">
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-white text-sm font-bold"
          style={{ background: "#2B7FFF", borderRadius: "0.75rem", padding: "4px 2.25rem" }}
        >
          Inventory
        </Link>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          Inventory Management
        </span>

        <div className="relative group flex items-center">
          <span
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-bold leading-none flex-shrink-0 cursor-pointer"
            style={{ border: "1.5px solid #2B7FFF", color: "#2B7FFF" }}
          >
            i
          </span>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
            <div className="w-2 h-2 bg-gray-800 dark:bg-zinc-800 rotate-45 -mr-1 flex-shrink-0" />
            <div className="bg-gray-800 dark:bg-zinc-800 text-white dark:text-zinc-100 text-sm rounded-lg px-4 py-3 text-center leading-snug w-80">
              Manage products, categories, warehouses, and inventory across your organization
            </div>
          </div>
        </div>
      </div>

      <nav className="flex items-center h-full">
        {navItems.map((item) => (
          <DropdownItem key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}
