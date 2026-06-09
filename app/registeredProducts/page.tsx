"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id:string;
  productName: string;
  productCode: string;
  brandName: string;
  categoryName: string;
  variantsCount: number;
  skuCount: number;
  status: boolean;
  createdAt: string;
};

const NAME_RE = /^[A-Za-z0-9 &.,'-]{2,80}$/;
const CODE_RE = /^[A-Z0-9-]{3,20}$/;

function isValidProduct(p: unknown): p is Product {
  if (!p || typeof p !== "object") return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.productName === "string" && NAME_RE.test(x.productName) &&
    typeof x.productCode === "string" && CODE_RE.test(x.productCode) &&
    typeof x.brandName === "string" && x.brandName.trim().length > 0 &&
    typeof x.categoryName === "string" && x.categoryName.trim().length > 0 &&
    typeof x.variantsCount === "number" && x.variantsCount >= 0 &&
    typeof x.skuCount === "number" && x.skuCount >= 0 &&
    typeof x.status === "boolean" &&
    typeof x.createdAt === "string"
  );
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/registeredProducts");
          if (!res.ok) {
            throw new Error("Failed to fetch");
          }
          const result = await res.json();
            console.log("Products API:", result.data);
            setProducts(result.data || []);
          } catch (error) {
              console.error(error);
              setProducts([]);
            }
      }
    load();
  }, []);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brandName))).sort(), [products]);
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.categoryName))).sort(), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ = !q || p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q);
      const matchB = brandFilter === "all" || p.brandName === brandFilter;
      const matchC = categoryFilter === "all" || p.categoryName === categoryFilter;
      return matchQ && matchB && matchC;
    });
  }, [products, query, brandFilter, categoryFilter]);

  const totalVariants = useMemo(() => products.reduce((a, p) => a + p.variantsCount, 0), [products]);
  const totalSkus = useMemo(() => products.reduce((a, p) => a + p.skuCount, 0), [products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
      <div className="mx-auto max-w-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">Products</h1>
            <p className="text-xs text-slate-500">Manage and view all registered products</p>
          </div>
<div className="rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">
  <button
    className="cursor-pointer"
    onClick={() => router.push("/products")}
  >
    Add Product
  </button>
</div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Products</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{products.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Variants</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalVariants}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">SKUs</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalSkus}</p>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name or code…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          />
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="all">All Brands</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Product","Code","Brand","Category","Variants","SKUs","Status","Created","Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-xs text-slate-400">No products found</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.productCode} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow">{initials(p.productName)}</div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-800">
                                      <button className="cursor-pointer" onClick={() => { router.push(`/products/${p.id}`) }}>{p.productName}</button>

                          </h3>
                          <p className="max-w-[140px] truncate text-[10px] text-slate-500">{p.productCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">{p.productCode}</span></td>
                    <td className="px-3 py-2 text-xs font-medium text-slate-700">{p.brandName}</td>
                    <td className="px-3 py-2"><span className="inline-flex rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{p.categoryName}</span></td>
                    <td className="px-3 py-2"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{p.variantsCount}</span></td>
                    <td className="px-3 py-2"><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{p.skuCount}</span></td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-2">
                       <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            router.push(`/products/${p.id}`)
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
            <span>Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}