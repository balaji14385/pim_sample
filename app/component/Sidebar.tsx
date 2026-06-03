"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
type SidebarProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

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
  productsData:
  "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7l8.7 5 8.7-5",} as const;
const MENU = [
  { to: "/registeredManufacturer", label: "Manufacturers", icon: ICONS.manufacturers },
  { to: "/registeredBrands", label: "Brands", icon: ICONS.brands },
  { to: "/registeredCategories", label: "Categories", icon: ICONS.categories },
  { to: "/registeredProducts", label: "Products", icon: ICONS.products },
  { to: "/productsData", label: "ProductsData", icon: ICONS.productsData },
] as const;

export default function Sidebar({
  open,
  setOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between bg-white px-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>

        <h2 className="font-bold">
          BOXAIO
        </h2>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          bg-white
          shadow-sm
          transition-all
          duration-300

          ${
            open
              ? "w-[212px]"
              : "w-[80px]"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5">
          <Image
            src="/boxaio-logo.png"
            alt="BOXAIO"
            width={40}
            height={40}
          />

          {open && (
            <div>
              <h1 className="font-bold text-green-600">
                BOXAIO
              </h1>
              <p className="text-xs text-slate-500">
                PIM Enterprise
              </p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 p-3">
          {MENU.map((item) => {
            const active =
              pathname === item.to;

            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3

                  ${
                    active
                      ? "bg-green-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                <Icon d={item.icon} />

                {open && (
                  <span>
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
    className="flex w-full items-center justify-center absolute bottom-0 text-lg gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-100"
  >
    <Icon d={ICONS.menu} size={18} />
          {open ? "Collapse" : "Expand"}
        </button>
      </aside>
    </>
  );
}


