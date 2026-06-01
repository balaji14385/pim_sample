import { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
   <div className="flex h-screen overflow-hidden">
  <Sidebar />

  <main className="ml-64 flex-1 min-w-0 overflow-y-auto">
    <div className="w-full overflow-x-auto">
      {children}
    </div>
  </main>
</div>
  );
}