"use client"
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CategoryRow = {
  categoryName: string;
  categoryCode: string;
  subCategory: string;
  industryName: string;
};

type GroupedCategory = {
  categoryName: string;
  categoryCode: string;
  industryName: string;
  subCategories: string[];
};


const NAME_RE = /^[A-Za-z0-9 &\-,.()]{2,80}$/;
const CODE_RE = /^[A-Z0-9]{2,10}$/;

function isValidRow(r: unknown): r is CategoryRow {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.categoryName === "string" && NAME_RE.test(o.categoryName) &&
    typeof o.categoryCode === "string" && CODE_RE.test(o.categoryCode) &&
    typeof o.subCategory === "string" && NAME_RE.test(o.subCategory) &&
    typeof o.industryName === "string" && NAME_RE.test(o.industryName)
  );
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
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

export default function CategoryListPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("ALL");
  const router = useRouter();

  useEffect(() => {
  async function disCat() {
    try {
      const res = await fetch("/api/registeredCategories");

      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await res.json();

      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error(error);
      setRows([]);
    }
  }

  disCat();
}, []);

  const grouped = useMemo<GroupedCategory[]>(() => {
    const map = new Map<string, GroupedCategory>();
    for (const r of rows) {
      const key = `${r.categoryCode}|${r.categoryName}`;
      const existing = map.get(key);
      if (existing) {
        if (!existing.subCategories.includes(r.subCategory)) existing.subCategories.push(r.subCategory);
      } else {
        map.set(key, { categoryName: r.categoryName, categoryCode: r.categoryCode, industryName: r.industryName, subCategories: [r.subCategory] });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const industries = useMemo(() => Array.from(new Set(grouped.map((g) => g.industryName))).sort(), [grouped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grouped.filter((g) => {
      if (industryFilter !== "ALL" && g.industryName !== industryFilter) return false;
      if (!q) return true;
      return (
        g.categoryName.toLowerCase().includes(q) ||
        g.categoryCode.toLowerCase().includes(q) ||
        g.industryName.toLowerCase().includes(q) ||
        g.subCategories.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [grouped, search, industryFilter]);

  const totalSubCategories = useMemo(() => rows.length, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
      <div className="mx-auto max-w-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">Categories</h1>
            <p className="text-xs text-slate-500">All registered categories with their sub-categories and industry mapping</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/categories")} className="rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-green-500/30 transition hover:shadow-lg">+ Add Category</button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Categories</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{grouped.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sub Categories</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalSubCategories}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Industries</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{industries.length}</p>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, code, sub-category or industry…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          />
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="ALL">All Industries</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Category","Code","Sub Categories","Industry","Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-400">No categories found.</td></tr>
                ) : (
                  filtered.map((g) => (
                    <tr key={`${g.categoryCode}-${g.categoryName}`} className="transition hover:bg-emerald-50/40">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow-sm">{initials(g.categoryName)}</div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900">{g.categoryName}</p>
                            <p className="truncate text-[10px] text-slate-400">{g.subCategories.length} sub categor{g.subCategories.length === 1 ? "y" : "ies"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">{g.categoryCode}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {g.subCategories.map((s) => (
                            <span key={s} className="inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{g.industryName}</span>
                      </td>
                      <td className="px-3 py-2"><RowActions /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <span>Showing {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}