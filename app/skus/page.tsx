"use client";

import { useState, useEffect, ChangeEvent, FocusEvent, FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface VariantOption {
  id: string;
  name: string;
}

interface FormValues {
  variantId: string;
  skuCode: string;
  mrp: string;
  sellingPrice: string;
}

interface FormErrors {
  variantId?: string;
  skuCode?: string;
  mrp?: string;
  sellingPrice?: string;
}

type FieldName = keyof FormValues;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SKU_REGEX = /^[A-Za-z0-9_\-/]+$/;

const INITIAL_VALUES: FormValues = {
  variantId: "",
  skuCode: "",
  mrp: "",
  sellingPrice: "",
};

const FALLBACK_VARIANTS: VariantOption[] = [
  { id: "V-2001", name: "Aurora Headphones — Midnight Black" },
  { id: "V-2002", name: "Aurora Headphones — Pearl White" },
  { id: "V-2003", name: "Nimbus Smart Watch — 42mm Silver" },
  { id: "V-2004", name: "Vertex Keyboard — TKL Red Switch" },
  { id: "V-2005", name: "Lumen Desk Lamp — Warm Brass" },
];

// ─── VALIDATION ───────────────────────────────────────────────────────────────
export function validateField(field: FieldName, value: string, all?: FormValues): string {
  const v = value.trim();
  switch (field) {
    case "variantId":
      if (!v) return "Variant is required";
      return "";
    case "skuCode":
      if (!value) return "SKU Code is required";
      if (!v) return "SKU Code cannot be only spaces";
      if (v.length < 3) return "Minimum 3 characters required";
      if (v.length > 40) return "Maximum 40 characters allowed";
      if (!SKU_REGEX.test(v)) return "Only letters, numbers, - _ / allowed";
      return "";
    case "mrp": {
      if (!value) return "MRP is required";
      if (!v) return "MRP cannot be only spaces";
      const n = Number(v);
      if (!Number.isFinite(n)) return "MRP must be a valid number";
      if (n <= 0) return "MRP must be greater than 0";
      if (n > 10000000) return "MRP is too large";
      if (!/^\d+(\.\d{1,2})?$/.test(v)) return "Max 2 decimal places";
      return "";
    }
    case "sellingPrice": {
      if (!value) return "Selling Price is required";
      if (!v) return "Selling Price cannot be only spaces";
      const n = Number(v);
      if (!Number.isFinite(n)) return "Selling Price must be a valid number";
      if (n <= 0) return "Selling Price must be greater than 0";
      if (n > 10000000) return "Selling Price is too large";
      if (!/^\d+(\.\d{1,2})?$/.test(v)) return "Max 2 decimal places";
      if (all && all.mrp.trim()) {
        const mrpN = Number(all.mrp.trim());
        if (Number.isFinite(mrpN) && n > mrpN)
          return "Selling Price cannot exceed MRP";
      }
      return "";
    }
    default:
      return "";
  }
}

function validateAll(values: FormValues): FormErrors {
  return {
    variantId: validateField("variantId", values.variantId, values),
    skuCode: validateField("skuCode", values.skuCode, values),
    mrp: validateField("mrp", values.mrp, values),
    sellingPrice: validateField("sellingPrice", values.sellingPrice, values),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
function Icon({
  d,
  size = 16,
  sw = 1.7,
  className = "",
}: {
  d: string[];
  size?: number;
  sw?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

const ICONS = {
  layers: [
    "M12 2L2 7l10 5 10-5-10-5z",
    "M2 17l10 5 10-5",
    "M2 12l10 5 10-5",
  ],
  hash: ["M4 9h16", "M4 15h16", "M10 3L8 21", "M16 3l-2 18"],
  rupee: ["M6 3h12", "M6 8h12", "M6 13c0-1 1-2 3-2 4 0 5 4 0 4H6l9 8"],
  tag: [
    "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
    "M7 7h.01",
  ],
  chevron: ["M6 9l6 6 6-6"],
  check: ["M20 6L9 17l-5-5"],
  alert: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  save: [
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",
    "M17 21v-8H7v8",
    "M7 3v5h8",
  ],
};

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function AddSkuPage() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(true);
  const [variant,setVariant]=useState([])
  async function blist(){
      try {
         let data= await fetch('/api/variantList')
       let finalData=await data.json()
        setVariant(finalData.data)
      } catch (error) {
        console.log(error.message)
      }finally {
    setVariantsLoading(false);
  }
     }
useEffect(()=>{
 blist()
},[])
console.log(variant)

  const fieldState = (field: FieldName): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (errors[field]) return "error";
    if (values[field].trim()) return "ok";
    return "";
  };

  const inputCls = (field: FieldName, extra = ""): string => {
    const state = fieldState(field);
    const base =
      "w-full bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-300 placeholder:text-[13px] outline-none transition-all duration-200 pl-10 pr-9 py-2.5 font-sans hover:bg-white hover:border-slate-300";
    const states: Record<string, string> = {
      error: "border-red-400 ring-2 ring-red-400/10 bg-red-50 hover:bg-red-50",
      ok: "border-emerald-400 ring-2 ring-emerald-400/10 bg-white hover:bg-white",
      "": "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white",
    };
    return `${base} ${states[state] ?? states[""]} ${extra}`;
  };

  const fireFieldToast = (field: FieldName, message: string) => {
    toast.error(message, { id: `err-${field}`, duration: 3000 });
  };

  const handleChange =
    (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setValues((prev) => {
        const next = { ...prev, [field]: val };
        if (touched[field]) {
          const err = validateField(field, val, next);
          setErrors((p) => ({ ...p, [field]: err }));
        } else {
          setErrors((p) => ({ ...p, [field]: "" }));
        }
        // Re-validate selling price when MRP changes
        if (field === "mrp" && touched.sellingPrice) {
          const spErr = validateField("sellingPrice", next.sellingPrice, next);
          setErrors((p) => ({ ...p, sellingPrice: spErr }));
        }
        return next;
      });
    };

  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const err = validateField(field, values[field], values);
      setErrors((prev) => ({ ...prev, [field]: err }));
      if (err) fireFieldToast(field, err);
    };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched({});
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({
      variantId: true,
      skuCode: true,
      mrp: true,
      sellingPrice: true,
    });
    const newErrors = validateAll(values);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      const order: FieldName[] = ["variantId", "skuCode", "mrp", "sellingPrice"];
      const firstField = order.find((k) => newErrors[k]);
      if (firstField) fireFieldToast(firstField, newErrors[firstField] as string);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
         let res=await fetch('/api/skus',{
        'method':'post',
        'headers':{
            'Content-Type':'application/json',

        },
        'body':JSON.stringify(values)
       })
       let data=await res.json()
       console.log(data)
      if(data.status==true)
      {
         const variant = variants.find((v) => v.id === values.variantId);
      toast.success(
        `SKU "${values.skuCode.trim()}" added to ${variant?.name ?? "variant"}`,
        { id: "sku-success", duration: 3500 },
      );
         handleReset();
         return ;
      }
            toast.error("Failed to save SKU", { id: "sku-fail" });

    } catch {
      toast.error("Failed to save SKU", { id: "sku-fail" });
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = variants.find((v) => v.id === values.variantId);
  const mrpNum = Number(values.mrp);
  const spNum = Number(values.sellingPrice);
  const discount =
    Number.isFinite(mrpNum) &&
    Number.isFinite(spNum) &&
    mrpNum > 0 &&
    spNum > 0 &&
    spNum <= mrpNum
      ? Math.round(((mrpNum - spNum) / mrpNum) * 100)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#1e293b",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
            fontSize: "13px",
          },
        }}
      />

      {/* Top brand bar */}
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-[760px] mx-auto w-full px-6 py-4 flex items-center gap-3">
          <img
            src="/boxaio-logo.png"
            alt="BOXAIO"
            className="h-9 w-9 object-contain"
          />
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              BOXAIO
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 -mt-0.5">
              PIM Enterprise
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[700px] mx-auto w-full px-6 pt-9 pb-20">
        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h2 className="text-[22px] font-medium text-slate-800 tracking-tight">
              Add SKU
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Create a new stock-keeping unit under an existing product variant
            </p>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 flex-shrink-0">
            <span className="text-red-500 text-sm leading-none">*</span> Required
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-white/90 backdrop-blur border border-slate-200 rounded-2xl px-8 py-7 shadow-[0_10px_40px_-20px_rgba(16,185,129,0.25)] overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              SKU details
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              {/* Variant Select */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="variantId"
                  className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                >
                  Variant
                  <span className="text-red-500 text-sm leading-none normal-case">
                    *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.layers} size={15} />
                  </span>
                  <select
                    id="variantId"
                    name="variantId"
                    value={values.variantId}
                    onChange={handleChange("variantId")}
                    onBlur={handleBlur("variantId")}
                    disabled={variantsLoading}
                    className={`${inputCls("variantId")} appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {variantsLoading ? "Loading variants…" : "Select a variant"}
                    </option>
                      {
           variant.map((e)=>{
    return <option key={e.id} value={e.id}>{e.name}</option>
   })
}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon d={ICONS.chevron} size={14} />
                  </span>
                </div>
                {touched.variantId && errors.variantId && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <Icon d={ICONS.alert} size={12} />
                    {errors.variantId}
                  </p>
                )}
                {selectedVariant && !errors.variantId && (
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {selectedVariant.id}
                  </p>
                )}
              </div>

              {/* SKU Code */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="skuCode"
                  className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                >
                  SKU code
                  <span className="text-red-500 text-sm leading-none normal-case">
                    *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.hash} size={15} />
                  </span>
                  <input
                    id="skuCode"
                    type="text"
                    name="skuCode"
                    placeholder="e.g. AUR-HDP-BLK-256"
                    value={values.skuCode}
                    onChange={handleChange("skuCode")}
                    onBlur={handleBlur("skuCode")}
                    className={`${inputCls("skuCode")} font-mono uppercase tracking-wide`}
                    maxLength={40}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {fieldState("skuCode") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Icon d={ICONS.check} size={14} sw={2.2} />
                    </span>
                  )}
                </div>
                {touched.skuCode && errors.skuCode ? (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <Icon d={ICONS.alert} size={12} />
                    {errors.skuCode}
                  </p>
                ) : (
                  <p className="text-[11px] font-mono text-slate-400">
                    3–40 chars · letters, numbers, - _ /
                  </p>
                )}
              </div>

              {/* MRP + Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* MRP */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="mrp"
                    className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                  >
                    MRP
                    <span className="text-red-500 text-sm leading-none normal-case">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[13px] font-medium">
                      ₹
                    </span>
                    <input
                      id="mrp"
                      type="number"
                      inputMode="decimal"
                      name="mrp"
                      placeholder="0.00"
                      value={values.mrp}
                      onChange={handleChange("mrp")}
                      onBlur={handleBlur("mrp")}
                      className={inputCls("mrp")}
                      min={0}
                      step="0.01"
                      autoComplete="off"
                    />
                    {fieldState("mrp") === "ok" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <Icon d={ICONS.check} size={14} sw={2.2} />
                      </span>
                    )}
                  </div>
                  {touched.mrp && errors.mrp ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                      <Icon d={ICONS.alert} size={12} />
                      {errors.mrp}
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-400">
                      Maximum retail price
                    </p>
                  )}
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sellingPrice"
                    className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                  >
                    Selling price
                    <span className="text-red-500 text-sm leading-none normal-case">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[13px] font-medium">
                      ₹
                    </span>
                    <input
                      id="sellingPrice"
                      type="number"
                      inputMode="decimal"
                      name="sellingPrice"
                      placeholder="0.00"
                      value={values.sellingPrice}
                      onChange={handleChange("sellingPrice")}
                      onBlur={handleBlur("sellingPrice")}
                      className={inputCls("sellingPrice")}
                      min={0}
                      step="0.01"
                      autoComplete="off"
                    />
                    {fieldState("sellingPrice") === "ok" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <Icon d={ICONS.check} size={14} sw={2.2} />
                      </span>
                    )}
                  </div>
                  {touched.sellingPrice && errors.sellingPrice ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                      <Icon d={ICONS.alert} size={12} />
                      {errors.sellingPrice}
                    </p>
                  ) : discount !== null && discount > 0 ? (
                    <p className="text-[11px] font-mono text-emerald-600">
                      {discount}% off MRP
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-400">
                      Must be ≤ MRP
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Icon d={ICONS.save} size={15} sw={2} />
                    Save SKU
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          BOXAIO · PIM Enterprise · SKUs
        </p>
      </main>
    </div>
  );
}