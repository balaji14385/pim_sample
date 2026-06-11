"use client"
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
 
// ── Types ──────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  productName: string;
  productCode: string;
  brandName: string;
  categoryName: string;
  variantsCount: number;
  skuCount: number;
  status: boolean;
  createdAt: string;
};
 
interface EditForm {
  id: string;
  name: string;
  brandId: string;
  subCategoryId: string;
  productCode: string;
  description: string;
  launchDate: string;
}
 
interface FormErrors {
  name?: string;
  brandId?: string;
  subCategoryId?: string;
  productCode?: string;
  description?: string;
  launchDate?: string;
}
 
interface DropdownItem {
  id: string;
  name: string;
}
 
// ── Constants ──────────────────────────────────────────────────────────────
const PRODUCT_CODE_REGEX = /^[A-Z0-9\-]{3,20}$/;
 
// ── Validation ─────────────────────────────────────────────────────────────
function validate(form: EditForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Product name is required.";
  else if (form.name.trim().length < 2) errors.name = "Must be at least 2 characters.";
  else if (form.name.trim().length > 120) errors.name = "Must be 120 characters or fewer.";
 
  if (!form.brandId) errors.brandId = "Please select a brand.";
  if (!form.subCategoryId) errors.subCategoryId = "Please select a sub category.";
 
  if (!form.productCode.trim()) errors.productCode = "Product code is required.";
  else if (!PRODUCT_CODE_REGEX.test(form.productCode.trim()))
    errors.productCode = "3–20 uppercase letters, digits, or hyphens (e.g. CLNP-001).";
 
  if (!form.description.trim()) errors.description = "Description is required.";
  else if (form.description.trim().length < 10) errors.description = "Must be at least 10 characters.";
  else if (form.description.trim().length > 1000) errors.description = "Must be 1,000 characters or fewer.";
 
  if (!form.launchDate) errors.launchDate = "Launch date is required.";
  else if (isNaN(new Date(form.launchDate).getTime())) errors.launchDate = "Enter a valid date.";
 
  return errors;
}
 
// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
 
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}
 
// ── Field components ───────────────────────────────────────────────────────
function FieldWrapper({
  label, required, error, children, hint,
}: {
  label: string; required?: boolean; error?: string;
  children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
        {label}
        {required && <span className="ml-1 text-emerald-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
          <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
 
function InputField({
  hasError, className = "", ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      className={`
        w-full rounded-md px-3 py-2 text-xs bg-white border
        placeholder-slate-300 text-slate-800 outline-none transition-all duration-200
        focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
        ${hasError
          ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
          : "border-slate-200 hover:border-slate-300"
        } ${className}
      `}
      {...rest}
    />
  );
}
 
// ── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteProductModal({
  product,
  onClose,
  onDeleted,
}: {
  product: Product;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [typedName, setTypedName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState("");
 
  const isMatch = typedName.trim() === product.productName.trim();
 
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
 async function deleteProduct(id:string)
 {
   try {
     const res=await fetch(`api/products/${id}`,{
      method:"DELETE",
     })
     let data=await res.json()
     if(!res.ok)
     {
      throw new Error("failed to deleted")
     }
     console.log(data)
     if(data.status)
     {
      let {name}=data.data[0]
       toast.success(`Successfully Deleted ${name}` || "Successfully Deleted")
       return;
     }
   } catch (error:any) {
     console.log(error)
     toast.error(error.message || "failed to deleted")
   }
 }
 
  async function handleDelete() {
    if (!isMatch) return;
 
    setDeleting(true);
    setApiError("");
 
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
 
      if (!res.ok) {
        throw new Error('Failed to Delete')
      }
      onDeleted();
      onClose();
    } catch (err: any) {
      setApiError(
      err.message || "Failed to fetch"
      );
    } finally {
      setDeleting(false);
    }
  }
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.18s ease-out" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
 
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-red-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Delete Product</h2>
              <p className="text-[10px] text-slate-400 font-medium">{product.productCode} · {product.brandName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
 
        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Warning notice */}
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3 py-3">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L1.5 13.5h13L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M8 6v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="text-[11px] text-red-600 leading-relaxed">
              This action is <span className="font-bold">permanent and cannot be undone.</span> Deleting this product will also remove all associated variants and SKUs.
            </p>
          </div>
 
          {/* Product info chip */}
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow flex-shrink-0">
              {initials(product.productName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{product.productName}</p>
              <p className="text-[10px] text-slate-400">{product.brandName} · {product.categoryName}</p>
            </div>
          </div>
 
          {/* Retype field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
              Type the product name to confirm
              <span className="ml-1 text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Please type{" "}
              <span className="font-semibold text-slate-600 bg-slate-100 rounded px-1 py-0.5 font-mono text-[10px]">
                {product.productName}
              </span>{" "}
              exactly to proceed.
            </p>
            <input
              type="text"
              value={typedName}
              onChange={(e) => { setTypedName(e.target.value); setApiError(""); }}
              placeholder={`Type "${product.productName}" here…`}
              autoFocus
              className={`
                w-full rounded-md px-3 py-2 text-xs bg-white border
                placeholder-slate-300 text-slate-800 outline-none transition-all duration-200
                ${typedName.length > 0 && !isMatch
                  ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  : isMatch
                    ? "border-emerald-400 bg-emerald-50 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
                    : "border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
                }
              `}
            />
            {/* Live match feedback */}
            {typedName.length > 0 && (
              <p className={`flex items-center gap-1 text-[10px] font-medium ${isMatch ? "text-emerald-600" : "text-red-500"}`}>
                {isMatch ? (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Name matches — you may now delete.
                  </>
                ) : (
                  <>
                    <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none">!</span>
                    Name does not match. Please type it exactly.
                  </>
                )}
              </p>
            )}
          </div>
 
          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-[10px] font-medium text-red-600 leading-relaxed">{apiError}</p>
            </div>
          )}
        </div>
 
        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isMatch || deleting}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm
              ${!isMatch || deleting
                ? "bg-red-200 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 active:scale-95 shadow-red-200"
              }`}
          >
            {deleting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    id: product.id,
    name: product.productName,
    brandId: "",
    subCategoryId: "",
    productCode: product.productCode,
    description:"",
    launchDate: "",
  });
 
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EditForm, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState("");
  const [brandList, setBrandList] = useState<DropdownItem[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<DropdownItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
 
  useEffect(() => {
    async function loadData() {
      try {
        const [brandsRes, scRes, productRes] = await Promise.all([
          fetch("/api/brandsList"),
          fetch("/api/subCategoryList"),
          fetch(`/api/products/${product.id}`),
        ]);
 
        const brandsData = await brandsRes.json();
        const scData = await scRes.json();
        setBrandList(brandsData.data ?? []);
        setSubCategoryList(scData.data ?? []);
 
        if (productRes.ok) {
          let pd: any = {};
          try { pd = await productRes.json(); console.log(pd) } catch { /* skip */ }
          const p = pd?.data;
          if (p) {
            setForm({
              id: product.id,
              name: p.name ?? product.productName,
              brandId: p.brandId ?? "",
              subCategoryId: p.subCategoryId ?? "",
              productCode: p.productCode ?? product.productCode,
              description: p.description ?? "",
              launchDate: p.launchDate ? p.launchDate.slice(0, 10) : "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load product or dropdowns:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [product.id]);
 
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
 
  function handleChange<K extends keyof EditForm>(key: K, value: string) {
    const updated = { ...form, [key]: value };
    setForm(updated);
    if (touched[key]) setErrors(validate(updated));
    setSaved(false);
    setApiError("");
  }
 
  function handleBlur(key: keyof EditForm) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setForm((cur) => { setErrors(validate(cur)); return cur; });
  }
 
  async function handleSave() {
    const allTouched = Object.fromEntries(
      (Object.keys(form) as (keyof EditForm)[]).map((k) => [k, true])
    ) as Record<keyof EditForm, boolean>;
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
 
    setSaving(true);
    setApiError("");
 
    try {
      const res = await fetch(`/api/products/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
 
      if (!res.ok) {
        let errMsg = `Server returned HTTP ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData?.message ?? errMsg;
        } catch {}
        setApiError(errMsg);
        return;
      }
 
      let data: any = {};
      try { data = await res.json(); } catch {}
 
      if (data.status === false) {
        setApiError(data.message || "Update failed. Please try again.");
        return;
      }
 
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 1100);
 
    } catch (err: any) {
      setApiError(
        err?.message === "Failed to fetch"
          ? "Network error — could not reach the server. Check your connection."
          : `Unexpected error: ${err?.message ?? "unknown"}`
      );
    } finally {
      setSaving(false);
    }
  }
 
  const charLeft = 1000 - form.description.length;
  const errorCount = Object.keys(errors).length;
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.18s ease-out" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
 
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Product</h2>
              <p className="text-[10px] text-slate-400 font-medium">{product.productCode} · {product.brandName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
 
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {loadingData ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-6 h-6 text-emerald-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-xs text-slate-400">Loading product data…</span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 flex flex-col gap-6">
 
              {/* Section: Identity */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-slate-100"/>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">Product Identity</span>
                  <div className="h-px flex-1 bg-slate-100"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 
                  <div className="sm:col-span-2">
                    <FieldWrapper label="Product Name" required error={touched.name ? errors.name : undefined}>
                      <InputField
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        placeholder="e.g. Clinic Plus Strong & Long Shampoo 340ml"
                        hasError={!!(touched.name && errors.name)}
                        maxLength={120}
                      />
                      <div className="flex justify-end mt-0.5">
                        <span className={`text-[9px] font-medium ${form.name.length > 100 ? "text-orange-400" : "text-slate-300"}`}>
                          {form.name.length}/120
                        </span>
                      </div>
                    </FieldWrapper>
                  </div>
 
                  <FieldWrapper label="Brand" required error={touched.brandId ? errors.brandId : undefined}>
                    <div className="relative">
                      <select
                        value={form.brandId}
                        onChange={(e) => handleChange("brandId", e.target.value)}
                        onBlur={() => handleBlur("brandId")}
                        className={`
                          w-full appearance-none rounded-md px-3 py-2 text-xs bg-white border
                          outline-none transition-all duration-200 cursor-pointer
                          focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
                          ${touched.brandId && errors.brandId
                            ? "border-red-300 bg-red-50 text-slate-400"
                            : form.brandId
                              ? "border-slate-200 text-slate-800 hover:border-slate-300"
                              : "border-slate-200 text-slate-400 hover:border-slate-300"
                          }
                        `}
                      >
                        <option value="" disabled>Select a brand…</option>
                        {brandList.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                        <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </FieldWrapper>
 
                  <FieldWrapper label="Sub Category" required error={touched.subCategoryId ? errors.subCategoryId : undefined}>
                    <div className="relative">
                      <select
                        value={form.subCategoryId}
                        onChange={(e) => handleChange("subCategoryId", e.target.value)}
                        onBlur={() => handleBlur("subCategoryId")}
                        className={`
                          w-full appearance-none rounded-md px-3 py-2 text-xs bg-white border
                          outline-none transition-all duration-200 cursor-pointer
                          focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
                          ${touched.subCategoryId && errors.subCategoryId
                            ? "border-red-300 bg-red-50 text-slate-400"
                            : form.subCategoryId
                              ? "border-slate-200 text-slate-800 hover:border-slate-300"
                              : "border-slate-200 text-slate-400 hover:border-slate-300"
                          }
                        `}
                      >
                        <option value="" disabled>Select a sub category…</option>
                        {subCategoryList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                        <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </FieldWrapper>
 
                  <div className="sm:col-span-2 sm:w-1/2">
                    <FieldWrapper
                      label="Product Code"
                      required
                      error={touched.productCode ? errors.productCode : undefined}
                      hint="Uppercase letters, digits, hyphens — e.g. CLNP-001"
                    >
                      <InputField
                        value={form.productCode}
                        onChange={(e) => handleChange("productCode", e.target.value.toUpperCase())}
                        onBlur={() => handleBlur("productCode")}
                        placeholder="e.g. CLNP-001"
                        hasError={!!(touched.productCode && errors.productCode)}
                        maxLength={20}
                      />
                    </FieldWrapper>
                  </div>
                </div>
              </div>
 
              {/* Section: Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-slate-100"/>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">Product Details</span>
                  <div className="h-px flex-1 bg-slate-100"/>
                </div>
                <div className="flex flex-col gap-4">
 
                  <FieldWrapper label="Description" required error={touched.description ? errors.description : undefined}>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      onBlur={() => handleBlur("description")}
                      placeholder="Describe the product — ingredients, benefits, usage…"
                      rows={4}
                      maxLength={1000}
                      className={`
                        w-full rounded-md px-3 py-2 text-xs bg-white border resize-none
                        placeholder-slate-300 text-slate-800 outline-none transition-all duration-200
                        focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
                        ${touched.description && errors.description
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 hover:border-slate-300"
                        }
                      `}
                    />
                    <div className="flex justify-end">
                      <span className={`text-[9px] font-medium ${charLeft < 50 ? "text-red-400" : charLeft < 150 ? "text-orange-400" : "text-slate-300"}`}>
                        {charLeft} characters remaining
                      </span>
                    </div>
                  </FieldWrapper>
 
                  <div className="sm:w-1/2">
                    <FieldWrapper
                      label="Launch Date"
                      required
                      error={touched.launchDate ? errors.launchDate : undefined}
                      hint="The date this product was or will be launched"
                    >
                      <InputField
                        type="date"
                        value={form.launchDate}
                        onChange={(e) => handleChange("launchDate", e.target.value)}
                        onBlur={() => handleBlur("launchDate")}
                        hasError={!!(touched.launchDate && errors.launchDate)}
                      />
                    </FieldWrapper>
                  </div>
                </div>
              </div>
 
              {errorCount > 0 && Object.keys(touched).length >= 6 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[10px] font-semibold text-red-500">
                    Please fix {errorCount} error{errorCount > 1 ? "s" : ""} before saving.
                  </p>
                </div>
              )}
 
              {apiError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[10px] font-medium text-red-600 leading-relaxed">{apiError}</p>
                </div>
              )}
            </div>
          )}
        </div>
 
        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Saved!
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingData}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm
                ${saving || loadingData
                  ? "bg-emerald-300 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-emerald-200"
                }`}
            >
              {saving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4.5L6.5 11 3 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ── Main: Products List Page ───────────────────────────────────────────────
export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const router = useRouter();
 
  async function loadProducts() {
    try {
      const res = await fetch("/api/registeredProducts");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    }
  }
 
  useEffect(() => { loadProducts(); }, []);
  
 
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
 
  const handleEditSaved = useCallback(() => { loadProducts(); }, []);
  const handleDeleted = useCallback(() => { loadProducts(); }, []);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
 
      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleEditSaved}
        />
      )}
 
      {/* Delete Modal */}
      {deletingProduct && (
        <DeleteProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onDeleted={handleDeleted}
        />
      )}
 
      <div className="mx-auto max-w-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">Products</h1>
            <p className="text-xs text-slate-500">Manage and view all registered products</p>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 shadow-sm">
            <button className="cursor-pointer text-sm font-semibold" onClick={() => router.push("/products")}>
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
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
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
                  <tr key={p.id} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow flex-shrink-0">
                          {initials(p.productName)}
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-800">
                            <button className="cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => router.push(`/products/${p.id}`)}>
                              {p.productName}
                            </button>
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
                        <button type="button" onClick={() => router.push(`/products/${p.id}`)} title="View"
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button type="button" onClick={() => setEditingProduct(p)} title="Edit"
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeletingProduct(p)} title="Delete"
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                          </svg>
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