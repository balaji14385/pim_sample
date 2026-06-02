"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNavigate } from "react-router-dom";
type Product = {
  productName: string;
  productCode: string;
  brandName: string;
  categoryName: string;
  variantCount: number;
  skuCount: number;
  status: boolean;
  created: string;
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
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const router=useRouter()
 useEffect(() => {
  async function loadProducts() {
    try {
      const res = await fetch("/api/registeredProducts");

      if (!res.status) {
        throw new Error("Failed to fetch");
      }

      const result = await res.json();

      setProducts(result.data || []);
    } catch (error:any) {
      console.error(error);
      setProducts([]);
    }
  }

  loadProducts();
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

  const totalVariants = useMemo(
  () => products.reduce((sum, p) => sum + p.variantCount, 0),
  [products]
);

const totalSkus = useMemo(
  () => products.reduce((sum, p) => sum + p.skuCount, 0),
  [products]
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                Products</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and view all registered products
            </p>
          </div>

          <div className="rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">
            <button className="cursor-pointer" onClick={()=>{router.push('/products')}}>Add Product</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Products</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Variants</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalVariants}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">SKUs</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalSkus}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name or code…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
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
                    "Product",
                    "Code",
                    "Brand",
                    "Category",
                    "Variants",
                    "SKUs",
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
                      No products found
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr
                    key={p.productCode}
                    className="group transition-all duration-300 hover:bg-emerald-50/40"
                  >
                    <td className="px-3 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white shadow">
                          {initials(p.productName)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{p.productName}</h3>
                          <p className="max-w-[150px] truncate text-xs text-slate-500">
                            {p.productCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-semibold">
                        {p.productCode}
                      </span>
                    </td>

                    <td className="px-4 py-5 text-sm font-medium text-slate-700">
                      {p.brandName}
                    </td>

                    <td className="px-4 py-5">
                      <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                        {p.categoryName}
                      </span>
                    </td>

       <td className="px-6 py-5">
  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
    {p.variantCount}
  </span>
</td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {p.skuCount}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                  <td className="px-6 py-5 text-sm text-slate-500">
  {formatDate(p.created)}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-slate-50 px-6 py-4 text-sm text-slate-500">
            <span>
              Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}
            </span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}