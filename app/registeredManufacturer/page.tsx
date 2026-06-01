"use client";

import { manufacturers } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const GST_RE =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;

function isValidRow(p: unknown): p is ManufacturerRow {
  if (!p || typeof p !== "object") return false;

  const x = p as Record<string, unknown>;

  return (
    typeof x.companyName === "string" &&
    COMPANY_RE.test(x.companyName) &&
    typeof x.gstNumber === "string" &&
    GST_RE.test(x.gstNumber) &&
    typeof x.address === "string" &&
    x.address.trim().length >= 3 &&
    typeof x.brandCount === "number" &&
    x.brandCount >= 0 &&
    typeof x.productName === "string" &&
    x.productName.trim().length > 0 &&
    typeof x.createdAt === "string"
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);

    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function ManufacturersListPage() {
  const [rows, setRows] = useState<ManufacturerRow[]>([]);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] =
    useState<string>("all");
 const router=useRouter()
useEffect(()=>{
   async function disMan() {
    try {
      let res = await fetch("/api/registeredManufacturer");
      let data = await res.json();
      setRows(data.data)
    } catch (error:any) {
        console.log(error.message)
    }
   }
   disMan()
  },[])
  console.log(rows)

const grouped = useMemo<GroupedManufacturer[]>(() => {
  const map = new Map<string, GroupedManufacturer>();

  for (const r of rows) {
    const key = `${r.companyName}|${r.gstNumber}`;

    const existing = map.get(key);

    // convert safely to number
    const brandCount = Number(r.brandCount) || 0;

    // valid product only
    const product =
      r.productName?.trim() || null;

    if (existing) {
      // prevent duplicate products
      if (
        product &&
        !existing.products.includes(product)
      ) {
        existing.products.push(product);
      }

      // IMPORTANT:
      // do NOT add counts
      // take maximum value only
      existing.brandCount = Math.max(
        existing.brandCount,
        brandCount
      );
    } else {
      map.set(key, {
        companyName: r.companyName,
        gstNumber: r.gstNumber,
        address: r.address,

        // initialize properly
        brandCount,

        products: product ? [product] : [],

        createdAt: r.createdAt,
      });
    }
  }

  return Array.from(map.values());
}, [rows]);
  const companies = useMemo(
    () =>
      Array.from(
        new Set(grouped.map((g) => g.companyName))
      ).sort(),
    [grouped]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return grouped.filter((g) => {
      const matchQ =
        !q ||
        g.companyName.toLowerCase().includes(q) ||
        g.gstNumber.toLowerCase().includes(q) ||
        g.address.toLowerCase().includes(q);

      const matchC =
        companyFilter === "all" ||
        g.companyName === companyFilter;

      return matchQ && matchC;
    });
  }, [grouped, query, companyFilter]);

  const totalBrands = useMemo(() => {
  return grouped.reduce(
    (acc, curr) =>
      acc + (curr.brandCount || 0),
    0
  );
}, [grouped]);
 const totalProducts = useMemo(() => {
  return grouped.reduce(
    (acc, curr) =>
      acc + curr.products.length,
    0
  );
}, [grouped]);
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Manufacturers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              BOXAIO — Manage and view all registered
              manufacturers.
            </p>
          </div>

          <div className="rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">
           <button onClick={()=>{router.push('/manufacture')}}>AddManufacture</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Manufacturers
            </p>

            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {grouped.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Brands
            </p>

            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {totalBrands}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Products
            </p>

            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {totalProducts}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by company, GST or address…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />

          <select
            value={companyFilter}
            onChange={(e) =>
              setCompanyFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">
              All Companies
            </option>

            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Company
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    GST Number
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Address
                  </th>

                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Brands
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Products
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      No manufacturers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr
                      key={`${m.companyName}-${m.gstNumber}`}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white shadow-sm">
                            {initials(m.companyName)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {m.companyName}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              Since{" "}
                              {formatDate(
                                m.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                          {m.gstNumber}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        <p
                          className="max-w-[260px] truncate"
                          title={m.address}
                        >
                          {m.address}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {m.brandCount}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex max-w-[260px] flex-wrap gap-1.5">
                          {m.products
                            .slice(0, 3)
                            .map((p) => (
                              <span
                                key={p}
                                className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
                              >
                                {p}
                              </span>
                            ))}

                          {m.products.length >
                            3 && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              +
                              {m.products
                                .length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(m.createdAt)}
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
            Showing {filtered.length} manufacturer
            {filtered.length !== 1
              ? "s"
              : ""}
          </span>

          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
}

export default ManufacturersListPage;