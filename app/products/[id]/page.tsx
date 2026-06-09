"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Variant = {
  id: string;
  name: string;
  sku: string;
  price: string;
  attributes: Record<string, string>;
};

type ProductDetail = {
  product: string;
  brand: string;
  category: string;
  variants: Variant[];
};

type ApiResponse = {
  status: boolean;
  message: string;
  data: ProductDetail[];
};

function isValidProduct(p: unknown): p is ProductDetail {
  if (!p || typeof p !== "object") return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.product === "string" &&
    typeof x.brand === "string" &&
    typeof x.category === "string" &&
    Array.isArray(x.variants)
  );
}

function formatINR(v: string) {
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export default function ProductViewPage({ productName }: { productName: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const params:{id:string}=useParams()

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(params.id)}`);
        if (!res.ok) throw new Error("non-200");
        const json: ApiResponse = await res.json();
        const list = Array.isArray(json?.data) ? json.data.filter(isValidProduct) : [];
        if (!cancelled) setProduct(list[0] ?? null);
      } catch {
        if (!cancelled) setError("Failed to load product details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
      <div className="mx-auto max-w-full">
      

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 shadow-sm">
            Loading product details…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-xs text-red-600 shadow-sm">{error}</div>
        )}

        {!loading && !error && !product && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-xs text-slate-400 shadow-sm">
            No product found
          </div>
        )}

        {!loading && !error && product && (
          <>
            {/* Product header card */}
            <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-xs font-bold text-white shadow">
                  {initials(product.product)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{product.product}</h2>
                  <p className="truncate text-[11px] text-slate-500">{product.brand} · {product.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brand</p>
                  <p className="text-xs font-semibold text-slate-800">{product.brand}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Category</p>
                  <p className="text-xs font-semibold text-slate-800">{product.category}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Variants</p>
                  <p className="text-xs font-semibold text-emerald-600">{product.variants.length}</p>
                </div>
              </div>
            </div>

            {/* Variants */}
            {product.variants.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 shadow-sm">
                This product has no variants.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {product.variants.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="border-b bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Variant</p>
                      <h3 className="truncate text-xs font-semibold text-slate-900">{v.name}</h3>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">{v.sku}</p>
                    </div>

                    <div className="px-3 py-2">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Attributes</p>
                      <div className="space-y-1.5">
                        {Object.entries(v.attributes).map(([k, val]) => (
                          <div key={k} className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">
                            <span className="text-[11px] font-medium text-slate-700">{k.trim()}</span>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price</p>
                        <p className="text-sm font-extrabold text-emerald-600">{formatINR(v.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}