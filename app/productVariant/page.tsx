"use client"
import { useState, useEffect, ChangeEvent, FocusEvent, FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

<Image
  src="/boxaio-logo.png"
  alt="BOXAIO"
  width={120}
  height={50}
/>

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ProductOption {
  id: string;
  name: string;
}
interface FormValues {
  productId: string;
  variantName: string;
}
interface FormErrors {
  productId?: string;
  variantName?: string;
}
type FieldName = keyof FormValues;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const VARIANT_REGEX = /^[A-Za-z0-9 _\-/().,&]+$/;

const INITIAL_VALUES: FormValues = {
  productId: "",
  variantName: "",
};



// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateField(field: FieldName, value: string): string {
  const v = value.trim();
  switch (field) {
    case "productId": {
      if (!v) return "Product is required";
      return "";
    }
    case "variantName": {
      if (!value) return "Variant Name is required";
      if (!v) return "Variant Name cannot be only spaces";
      if (v.length < 2) return "Minimum 2 characters required";
      if (v.length > 60) return "Maximum 60 characters allowed";
      if (!VARIANT_REGEX.test(v)) return "Invalid characters in variant name";
      return "";
    }
    default:
      return "";
  }
}

function validateAll(values: FormValues): FormErrors {
  return {
    productId: validateField("productId", values.productId),
    variantName: validateField("variantName", values.variantName),
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
  box: [
    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    "M3.27 6.96L12 12.01l8.73-5.05",
    "M12 22.08V12",
  ],
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
export default function AddProductVariantPage() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
   const [product,setProduct]=useState([])
  async function blist(){
      try {
         let data= await fetch('/api/productList')
       let finalData=await data.json()
        setProduct(finalData.data)
      } catch (error) {
        console.log(error.message)
      }finally {
    setProductsLoading(false);
  }
     }
useEffect(()=>{
 blist()
},[])
console.log(product)
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

  // Prevent duplicate toasts per field
  const fireFieldToast = (field: FieldName, message: string) => {
    toast.error(message, { id: `err-${field}`, duration: 3000 });
  };

  const handleChange =
    (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) {
        const err = validateField(field, val);
        setErrors((prev) => ({ ...prev, [field]: err }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const err = validateField(field, values[field]);
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
    setTouched({ productId: true, variantName: true });
    const newErrors = validateAll(values);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      const firstField = (Object.keys(newErrors) as FieldName[]).find(
        (k) => newErrors[k],
      );
      if (firstField) fireFieldToast(firstField, newErrors[firstField] as string);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
         let res=await fetch('/api/productVariant',{
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
        const product = products.find((p) => p.id === values.productId);
      toast.success(
        `Variant "${values.variantName.trim()}" added to ${product?.name ?? "product"}`,
        { id: "variant-success", duration: 3500 },
      );
         handleReset();
         return ;
      }
      toast.error("Failed to save variant", { id: "variant-fail" });
      handleReset();
    } catch {
      toast.error("Failed to save variant", { id: "variant-fail" });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === values.productId);

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
              Add product variant
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Define a new variant for an existing product in your catalog
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
              Variant details
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              {/* Product Select */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="productId"
                  className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                >
                  Product
                  <span className="text-red-500 text-sm leading-none normal-case">
                    *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.box} size={15} />
                  </span>
                  <select
                    id="productId"
                    name="productId"
                    value={values.productId}
                    onChange={handleChange("productId")}
                    onBlur={handleBlur("productId")}
                    disabled={productsLoading}
                    className={`${inputCls("productId")} appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {productsLoading ? "Loading products…" : "Select a product"}
                    </option>
                   {
           product.map((e)=>{

    return <option key={e.id} value={e.id}>{e.name}</option>
   })
}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon d={ICONS.chevron} size={14} />
                  </span>
                </div>
                {touched.productId && errors.productId && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <Icon d={ICONS.alert} size={12} />
                    {errors.productId}
                  </p>
                )}
                {selectedProduct && !errors.productId && (
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {selectedProduct.id}
                  </p>
                )}
              </div>

              {/* Variant Name — floating label */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="variantName"
                  className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                >
                  Variant name
                  <span className="text-red-500 text-sm leading-none normal-case">
                    *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.tag} size={15} />
                  </span>
                  <input
                    id="variantName"
                    type="text"
                    name="variantName"
                    placeholder="e.g. Midnight Black — 256 GB"
                    value={values.variantName}
                    onChange={handleChange("variantName")}
                    onBlur={handleBlur("variantName")}
                    className={inputCls("variantName")}
                    maxLength={60}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {fieldState("variantName") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Icon d={ICONS.check} size={14} sw={2.2} />
                    </span>
                  )}
                </div>
                {touched.variantName && errors.variantName ? (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <Icon d={ICONS.alert} size={12} />
                    {errors.variantName}
                  </p>
                ) : (
                  <p className="text-[11px] font-mono text-slate-400">
                    2–60 chars · letters, numbers, spaces and . , - _ / ( ) &
                  </p>
                )}
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
                    Save variant
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          BOXAIO · PIM Enterprise · Product Variants
        </p>
      </main>
    </div>
  );
}