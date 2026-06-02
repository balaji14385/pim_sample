"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// ─── Types ────────────────────────────────────────────────────────────────────
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


// ─── Validation (defensive: rows from API may be malformed) ───────────────────
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

export default function CategoryListPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("ALL");
  const router=useRouter()
  useEffect(()=>{
   async function disCat() {
    try {
      let res = await fetch("/api/registeredCategories");
      let data = await res.json();
      setRows(data.data)
    } catch (error:any) {
        console.log(error.message)
    }
   }
   disCat()
  },[])
  console.log(rows)
  // Group by category (so each category lists all its sub-categories)
  const grouped = useMemo<GroupedCategory[]>(() => {
    const map = new Map<string, GroupedCategory>();
    for (const r of rows) {
      const key = `${r.categoryCode}|${r.categoryName}`;
      const existing = map.get(key);
      if (existing) {
       if (
  r.subCategory &&
  r.subCategory !== "null" &&
  r.subCategory.trim() !== "" &&
  !existing.subCategories.includes(r.subCategory)
) {
  existing.subCategories.push(r.subCategory);
}
      } else {
        map.set(key, {
          categoryName: r.categoryName,
          categoryCode: r.categoryCode,
          industryName: r.industryName,
subCategories:
  r.subCategory &&
  r.subCategory !== "null" &&
  r.subCategory.trim() !== ""
    ? [r.subCategory]
    : [],        });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const industries = useMemo(
    () => Array.from(new Set(grouped.map((g) => g.industryName))).sort(),
    [grouped],
  );

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

const totalSubCategories = useMemo(() => {
  return rows.filter(
    (r) =>
      r.subCategory &&
      r.subCategory !== "null" &&
      r.subCategory.trim() !== ""
  ).length;
}, [rows]);
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Categories
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              All registered categories with their sub-categories and industry mapping
            </p>
          </div>
          <div className="rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">
           <button className="cursor-pointer" onClick={()=>{router.push('/categories')}}>Add Category</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Categories</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{grouped.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sub Categories</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalSubCategories}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Industries</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{industries.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, code, sub-category or industry…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="ALL">All Industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sub Categories</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Industry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr key={`${g.categoryCode}-${g.categoryName}`} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white shadow-sm">
                            {initials(g.categoryName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{g.categoryName}</p>
                            <p className="truncate text-xs text-slate-400">{g.subCategories.length} sub categor{g.subCategories.length === 1 ? "y" : "ies"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                          {g.categoryCode}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {g.subCategories.map((s) => (
                            <span
                              key={s}
                              className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 w-1">
                        <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                          {g.industryName}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}
          </span>
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
}