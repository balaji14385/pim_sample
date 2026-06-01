"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
type Brand = {
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
  const router=useRouter()
  useEffect(() => {
    async function display() {
      try {
        const res = await fetch("/api/registeredBrands");
        const data = await res.json();
        console.log(data);
        setBrands(data.data);
      } catch (error: any) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    display();
  }, []);

  const formatBrandType = (type: string) =>
    type
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const companies = useMemo(
    () => Array.from(new Set(brands.map((b) => b.companyName))).sort(),
    [brands]
  );
  const types = useMemo(
    () => Array.from(new Set(brands.map((b) => b.brandType))).sort(),
    [brands]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands.filter((b) => {
      const matchQ =
        !q ||
        b.brandName.toLowerCase().includes(q) ||
        b.brandCode.toLowerCase().includes(q);
      const matchC = companyFilter === "all" || b.companyName === companyFilter;
      const matchT = typeFilter === "all" || b.brandType === typeFilter;
      return matchQ && matchC && matchT;
    });
  }, [brands, query, companyFilter, typeFilter]);

  const totalProducts = useMemo(
    () => brands.reduce((a, b) => a + (Number(b.productCount) || 0), 0),
    [brands]
  );
  const totalCompanies = useMemo(
    () => new Set(brands.map((b) => b.companyName)).size,
    [brands]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Brands</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and view all registered brands
            </p>
          </div>

          <div className="rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">
            <button onClick={()=>{router.push('/brands')}}>AddBrand</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Brands</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{brands.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Products</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Companies</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalCompanies}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name or code…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{formatBrandType(t)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className=" bg-slate-50">
                <tr>
                  {[
                    "Brand",
                    "Parent Brand",
                    "Code",
                    "Type",
                    "Company",
                    "Products",
                    "Status",
                    "Created",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                      No brands found
                    </td>
                  </tr>
                )}
                {filtered.map((brand) => (
                  <tr
                    key={brand.brandCode}
                    className="group transition-all duration-300 hover:bg-emerald-50/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white shadow">
                          {initials(brand.brandName)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{brand.brandName}</h3>
                          <p className="max-w-[150px] truncate text-xs text-slate-500">
                            {brand.logo || "No logo"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {brand.parentBrandName ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          {brand.parentBrandName}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                          Independent
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-semibold">
                        {brand.brandCode}
                      </span>
                    </td>

                    <td className="px-3 py-5">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {formatBrandType(brand.brandType)}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {brand.companyName}
                    </td>

                    <td className="px-6 py-5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm">
                        {brand.productCount}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          brand.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {brand.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(brand.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-slate-50 px-6 py-4 text-sm text-slate-500">
            <span>
              Showing {filtered.length} brand{filtered.length === 1 ? "" : "s"}
            </span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}