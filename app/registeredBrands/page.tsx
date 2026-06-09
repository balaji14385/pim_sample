"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Brand = {
  id: string;
  logo: string;
  brandName: string;
  parentBrandName?: string;
  brandCode: string;
  brandType: string;
  companyName: string;
  productCount: number;
  status: boolean;
  createdAt: string;
};



export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    async function display() {
      try {
        const res = await fetch("/api/registeredBrands");
        const data = await res.json();
        setBrands(data.data);
      } catch (error: unknown) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    display();
  }, []);
  const formatBrandType = (type: string) =>
    type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const companies = useMemo(() => Array.from(new Set(brands.map((b) => b.companyName))).sort(), [brands]);
  const types = useMemo(() => Array.from(new Set(brands.map((b) => b.brandType))).sort(), [brands]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands.filter((b) => {
      const matchQ = !q || b.brandName.toLowerCase().includes(q) || b.brandCode.toLowerCase().includes(q);
      const matchC = companyFilter === "all" || b.companyName === companyFilter;
      const matchT = typeFilter === "all" || b.brandType === typeFilter;
      return matchQ && matchC && matchT;
    });
  }, [brands, query, companyFilter, typeFilter]);

  const totalProducts = useMemo(() => brands.reduce((a, b) => a + (Number(b.productCount) || 0), 0), [brands]);
  const totalCompanies = useMemo(() => new Set(brands.map((b) => b.companyName)).size, [brands]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">Brands</h1>
            <p className="text-xs text-slate-500">Manage and view all registered brands</p>
          </div>
          <div className="rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-green-500/30 transition hover:shadow-lg">
            <button className="cursor-pointer" onClick={() => router.push("/brands")}>+ Add Brand</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brands</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{brands.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Products</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalProducts}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Companies</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalCompanies}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name or code…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          >
            <option value="all">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          >
            <option value="all">All Types</option>
            {types.map((t) => <option key={t} value={t}>{formatBrandType(t)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Brand", "Parent Brand", "Code", "Type", "Company", "Products", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-xs text-slate-400">No brands found</td></tr>
                )}
                {filtered.map((brand) => (
                  <tr key={brand.brandCode} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow">
                          {initials(brand.brandName)}
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-800">

                            <button className="cursor-pointer" onClick={() => { router.push(`/brands/${brand.id}`) }}>{brand.brandName}</button>
                          </h3>
                          <p className="max-w-[120px] truncate text-[10px] text-slate-500">{brand.logo || "No logo"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {brand.parentBrandName ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{brand.parentBrandName}</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Independent</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">{brand.brandCode}</span>
                    </td>
                    <td className="px-3 py-2">
                     <span className="inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">{formatBrandType(brand.brandType)}</span>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-slate-700">{brand.companyName}</td>
                    <td className="px-3 py-2">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">                        {brand.productCount}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${brand.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {brand.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{formatDate(brand.createdAt)}</td>
                    <td className="px-3 py-2">

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            router.push(`/brands/${brand.id}`)
                          }}
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        <button
                          type="button"

                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <span>Showing {filtered.length} brand{filtered.length === 1 ? "" : "s"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}