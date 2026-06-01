"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  manufacturers:
    "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
  industries: "M2 20h20M4 20V8l6 4V8l6 4V8l4 3v9",
  brands:
    "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  categories: "M4 6h16M4 12h16M4 18h16",
  products:
    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  menu: "M3 6h18M3 12h18M3 18h18",
} as const;

const MENU = [
  { to: "/registeredManufacturer", label: "Manufacturers", icon: ICONS.manufacturers },
  { to: "/registeredBrands", label: "Brands", icon: ICONS.brands },
  { to: "/registeredCategories", label: "Categories", icon: ICONS.categories },
  { to: "/registeredProducts", label: "Products", icon: ICONS.products },
] as const;

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  // Changed from useRouterState()
  const pathname = usePathname();

  return (
<div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
       <aside
    className={`${
      open ? "w-[212px]" : "w-20"
    } fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 md:flex`}
  >

        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-5">

          <Image
            src="/boxaio-logo.png"
            alt="BOXAIO"
            width={40}
            height={40}
            className="shrink-0 object-contain"
          />

          {open && (
            <div className="min-w-0">
              <h1 className="truncate bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                BOXAIO
              </h1>

              <p className="truncate text-[10px] font-medium uppercase tracking-widest text-slate-400">
                PIM Enterprise
              </p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MENU.map((item) => {
            const active = pathname === item.to;

            return (
              <Link
                key={item.to}
                href={item.to}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={!open ? item.label : undefined}
              >
                <Icon d={item.icon} size={18} />

                {open && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="m-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          <Icon d={ICONS.menu} size={14} />

          {open && <span>Collapse</span>}
        </button>

      </aside>

      {/* Main */}

    </div>
  );
}