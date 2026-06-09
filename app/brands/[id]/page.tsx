"use client"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
 
type SkuRow = {
  productName: string;
   brandName: string;
  variantName: string;
  skuCode: string;
  companyName: string;
  skuCount: number;
};
 
type BrandMeta = {
  brandName: string;
  companyName?: string;
};
 
const initials = (name: string) =>
  name.split(" ").map((n) => n[0] ?? "").join("").slice(0, 2).toUpperCase();
 
export default function BrandDetailsPage() {
  const params = useParams();
  const brandParam = (params?.brandName ?? params?.id ?? "") as string;
 
  const [rows, setRows] = useState<SkuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [brandMeta, setBrandMeta] = useState<BrandMeta>({ brandName: "" });
 
  useEffect(() => {
    if (!brandParam) return;
 
    async function getData() {
      try {
        const res = await fetch(`/api/brands/${encodeURIComponent(brandParam)}`);
        const data = await res.json();
 
        // Resolve brand display name from API — never fall back to raw param for name
        const resolvedName: string =
          data?.brand?.brandName ??
          data?.brandName ??
          data?.name ??
          "";
 
        // Resolve company name
        const resolvedCompany: string =
          data?.brand?.companyName ??
          data?.companyName ??
          "";
 
        // Only use real rows — no Samsung sample fallback
const list = Array.isArray(data?.data)
  ? data.data.filter((item: any) => item.productName)
  : []; 
        setBrandMeta({
  brandName:
    data?.data?.[0]?.brandName ||
    resolvedName ||
    brandParam,
  companyName:
    data?.data?.[0]?.companyName ||
    resolvedCompany ||
    "—",
});
        setRows(list);
      } catch (error) {
        console.log(error);
        // On error still show the brand param as heading, no products
        setBrandMeta({ brandName: brandParam, companyName: "—" });
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [brandParam]);
 
  const products = useMemo(() => {
    const map = new Map<string, SkuRow[]>();
    rows.forEach((r) => {
      if (!map.has(r.productName)) map.set(r.productName, []);
      map.get(r.productName)!.push(r);
    });
    return Array.from(map.entries()).map(([name, variants]) => ({ name, variants }));
  }, [rows]);
 
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products
      .map((p) => ({
        ...p,
        variants: p.variants.filter(
          (v) =>
            p.name.toLowerCase().includes(q) ||
            v.variantName.toLowerCase().includes(q) ||
            v.skuCode.toLowerCase().includes(q)
        ),
      }))
      .filter((p) => p.variants.length > 0);
  }, [products, query]);
 
  const totalSkus = rows.reduce((a, r) => a + (Number(r.skuCount) || 0), 0);
  const heading = brandMeta.brandName || "…";
  const companyName = brandMeta.companyName || "—";
  const totalVariants = rows.filter(
    (r) => r.variantName && r.variantName.trim() !== ""
  ).length;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
 
 
        {/* Brand profile card — always visible */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-2xl font-bold text-white shadow">
              {heading && initials(heading)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{heading}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Manufactured by <span className="font-semibold text-slate-800">{companyName}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {products.length} Product{products.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {totalVariants} Variant{totalVariants === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {totalSkus} SKU{totalSkus === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
 
          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          </div>
        </div>
 
        {/* Search — only shown when there are products */}
        {rows.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, variant or SKU code…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        )}
 
        {/* Products & variants */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
            Loading brand details…
          </div>
        ) : rows.length === 0 ? (
          // No products at all for this brand
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-2xl mb-2">📦</p>
            <p className="text-sm font-semibold text-slate-600">No products listed for {heading}</p>
            <p className="mt-1 text-xs text-slate-400">Products mapped to this brand will appear here.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          // Products exist but search found nothing
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
            No products match your search
          </div>
        ) : (
          <div className="space-y-5">
            {filteredProducts.map((p) => (
              <div
                key={p.name}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-bold text-white">
                      {p && initials(p.name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{p.name}</h3>
                      <p className="text-xs text-slate-500">
                        {
                          p.variants.filter(
                            (v) => v.variantName && v.variantName.trim() !== ""
                          ).length
                        } variant
                        {
                          p.variants.filter(
                            (v) => v.variantName && v.variantName.trim() !== ""
                          ).length === 1
                          ? ""
                          : "s"
                        }
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {p.variants.reduce((a, v) => a + (Number(v.skuCount) || 0), 0)} SKUs
                  </span>
                </div>
 
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white">
                      <tr>
                        {["Variant", "SKU Code", "Company", "Qty"].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {p.variants.map((v) => (
                        <tr key={v.skuCode} className="transition hover:bg-emerald-50/40">
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{v.variantName}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                              {v.skuCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{v.companyName}</td>
                          <td className="px-6 py-4">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                              {v.skuCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}