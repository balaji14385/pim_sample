"use client"
import { useState } from "react";
import { ReactNode } from "react";
import Sidebar from "./Sidebar"
export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main
        className={`
          h-screen
          overflow-hidden
          transition-all
          duration-300
          ${
            sidebarOpen
              ? "md:ml-[212px]"
              : "md:ml-[80px]"
          }
        `}
      >
        {/* Only content scrolls horizontally */}
        <div className="h-full overflow-y-auto overflow-x-auto p-4 mt-6">
          {children}
        </div>
      </main>
    </div>
  );
}