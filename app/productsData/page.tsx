"use client"
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SkuRow = {
  productName: string;
  variantName: string;
  attributeName: string;
  value: string;
  mrp: string;
  sellingPrice: string;
};

type GroupedSku = {
  productName: string;
  variantName: string;
  mrp: string;
  sellingPrice: string;
  attributes: { name: string; value: string }[];
};

export default function ProductDetailsPage() {
  const [rows, setRows] = useState<SkuRow[]>([]);
  const [query, setQuery] = useState("");
  const router=useRouter()

  useEffect(() => {
    async function display() {
      try {
        const res = await fetch("/api/productsData");
        const data = await res.json();
        console.log(data);
        setRows(Array.isArray(data.data) ? data.data : []);
      } catch (error: unknown) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    display();
  }, []);

  const grouped = useMemo<GroupedSku[]>(() => {
    const map = new Map<string, GroupedSku>();
    for (const r of rows) {
      const key = `${r.productName}|${r.variantName}`;
      const existing = map.get(key);
      if (existing) {
        existing.attributes.push({ name: r.attributeName, value: r.value });
      } else {
        map.set(key, {
          productName: r.productName,
          variantName: r.variantName,
          mrp: r.mrp,
          sellingPrice: r.sellingPrice,
          attributes: [{ name: r.attributeName, value: r.value }],
        });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    return grouped.filter(
      (g) =>
        g.productName.toLowerCase().includes(q) ||
        g.variantName.toLowerCase().includes(q)
    );
  }, [grouped, query]);

  const totalProducts = useMemo(
    () => new Set(grouped.map((g) => g.productName)).size,
    [grouped]
  );

  const formatINR = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const discountPct = (mrp: string, sp: string) => {
    const m = Number(mrp);
    const s = Number(sp);
    if (!m || !s || s >= m) return 0;
    return Math.round(((m - s) / m) * 100);
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                Product Details</h1>
            <p className="mt-1 text-sm text-slate-500">
              SKU details, attributes and pricing for all product variants
            </p>
          </div>
          <div className=" rounded-xl border bg-gradient-to-r from-green-500 to-emerald-600 bg-clip text-white px-4 py-2 shadow-sm">

            <button className="cursor-pointer" onClick={() => { router.push('/productVariant') }}>Add Product Varinat</button>
          </div>
        </div>

        {/* Stats */}
        <div className=" mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Products</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Variants</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{grouped.length}</p>
          </div>
         
        </div>

        {/* Filter */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product or variant…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
            No product details found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((g) => {
              const off = discountPct(g.mrp, g.sellingPrice);
              return (
                <div
                  key={`${g.productName}|${g.variantName}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* SKU Details */}
                  <div className="flex justify-around flex-col">

                    <div>
                            <div className=" bg-gradient-to-r from-emerald-50 to-green-50 px-5 py-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
                      SKU Details
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white shadow">
                        {initials(g.productName)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-800">
                          {g.productName}
                        </h3>
                        <p className="truncate text-xs text-slate-500">{g.variantName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="px-5 py-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Attributes
                    </p>
                    <div className="space-y-2">
                      {g.attributes.map((a, i) => (
                        <div
                          key={`${a.name}-${i}`}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {a.name}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {a.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                    </div>
                

                  {/* Pricing */}
                  <div>
                    <div className="border bg-slate-50 border-gray-200 px-5 py-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Pricing
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">MRP</p>
                        <p className="text-sm font-medium text-slate-500 line-through">
                          {formatINR(g.mrp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Sale Price</p>
                        <p className="text-xl font-extrabold text-emerald-600">
                          {formatINR(g.sellingPrice)}
                        </p>
                      </div>
                      {off > 0 && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {off}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}