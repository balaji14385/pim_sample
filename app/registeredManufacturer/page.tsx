"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ManufacturerRow = {
  companyName: string;
  gstNumber: string;
  address: string;
  brandCount: number;
  productName: string;
  createdAt: string;
};

type GroupedManufacturer = {
  companyName: string;
  gstNumber: string;
  address: string;
  brandCount: number;
  products: string[];
  createdAt: string;
};

const COMPANY_RE = /^[A-Za-z0-9 &.,'()-]{2,120}$/;
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;

function isValidRow(p: unknown): p is ManufacturerRow {
  if (!p || typeof p !== "object") return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.companyName === "string" && COMPANY_RE.test(x.companyName) &&
    typeof x.gstNumber === "string" && GST_RE.test(x.gstNumber) &&
    typeof x.address === "string" && x.address.trim().length >= 3 &&
    typeof x.brandCount === "number" && x.brandCount >= 0 &&
    typeof x.productName === "string" && x.productName.trim().length > 0 &&
    typeof x.createdAt === "string"
  );
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return iso; }
}

function RowActions() {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" title="View" className="rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button type="button" title="Edit" className="rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>
      <button type="button" title="Delete" className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  );
}

export default function ManufacturersListPage() {
  const [rows, setRows] = useState<ManufacturerRow[]>([]);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
  async function disMan() {
    try {
      const res = await fetch("/api/registeredManufacturer");

      if (!res.ok) {
        throw new Error("Failed to fetch manufacturers");
      }

      const data = await res.json();

      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error(error);
      setRows([]);
    }
  }

  disMan();
}, []);

  const grouped = useMemo<GroupedManufacturer[]>(() => {
    const map = new Map<string, GroupedManufacturer>();
    for (const r of rows) {
      const key = `${r.companyName}|${r.gstNumber}`;
      const existing = map.get(key);
      if (existing) {
        const product = r.productName?.trim();

if (product && !existing.products.includes(product)) {
  existing.products.push(product);
}

existing.brandCount = Math.max(
  existing.brandCount,
  Number(r.brandCount) || 0
);
      } else {
        map.set(key, {
          companyName: r.companyName, gstNumber: r.gstNumber, address: r.address,
          brandCount: Number(r.brandCount) || 0,products: r.productName?.trim() ? [r.productName] : [], createdAt: r.createdAt,
        });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const companies = useMemo(() => Array.from(new Set(grouped.map((g) => g.companyName))).sort(), [grouped]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grouped.filter((g) => {
      const matchQ = !q || g.companyName.toLowerCase().includes(q) || g.gstNumber.toLowerCase().includes(q) || g.address.toLowerCase().includes(q);
      const matchC = companyFilter === "all" || g.companyName === companyFilter;
      return matchQ && matchC;
    });
  }, [grouped, query, companyFilter]);

  const totalBrands = useMemo(() => grouped.reduce((a, g) => a + g.brandCount, 0), [grouped]);
  const totalProducts = useMemo(() => grouped.reduce((a, g) => a + g.products.length, 0), [grouped]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
      <div className="mx-auto max-w-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">Manufacturers</h1>
            <p className="text-xs text-slate-500">BOXAIO — Manage and view all registered manufacturers</p>
          </div>
          <div className="rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">
            <button className="cursor-pointer" onClick={() => router.push("/manufacture")}>Add Manufacture</button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Manufacturers</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{grouped.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brands</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalBrands}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Products</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalProducts}</p>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, GST or address…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          />
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="all">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Company","GST Number","Address","Brands","Products","Created","Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-400">No manufacturers found</td></tr>
                )}
                {filtered.map((m) => (
                  <tr key={`${m.companyName}-${m.gstNumber}`} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow">{initials(m.companyName)}</div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-800">{m.companyName}</h3>
                          <p className="max-w-[160px] truncate text-[10px] text-slate-500">Since {formatDate(m.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">{m.gstNumber}</span></td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      <p className="max-w-[220px] truncate" title={m.address}>{m.address}</p>
                    </td>
                    <td className="px-3 py-2">
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{m.brandCount}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex max-w-[240px] flex-wrap gap-1">
                        {m.products.slice(0, 3).map((p) => (
                          <span key={p} className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{p}</span>
                        ))}
                        {m.products.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">+{m.products.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{formatDate(m.createdAt)}</td>
                    <td className="px-3 py-2"><RowActions /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <span>Showing {filtered.length} manufacturer{filtered.length === 1 ? "" : "s"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}