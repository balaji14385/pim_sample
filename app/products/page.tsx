"use client"
import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductForm {
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

interface Brand {
  id: string;
  name: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const PRODUCT_CODE_REGEX = /^[A-Z0-9\-]{3,20}$/;

// ── Validation ─────────────────────────────────────────────────────────────
function validate(form: ProductForm): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Product name is required.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Product name must be at least 2 characters.";
  } else if (form.name.trim().length > 120) {
    errors.name = "Product name must be 120 characters or fewer.";
  }

  if (!form.brandId) {
    errors.brandId = "Please select a brand.";
  }
  if (!form.subCategoryId) {
    errors.subCategoryId = "Please select a sub category.";
  }

  if (!form.productCode.trim()) {
    errors.productCode = "Product code is required.";
  } else if (!PRODUCT_CODE_REGEX.test(form.productCode.trim())) {
    errors.productCode =
      "Code must be 3–20 uppercase letters, digits, or hyphens (e.g. CLNP-001).";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  } else if (form.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  } else if (form.description.trim().length > 1000) {
    errors.description = "Description must be 1 000 characters or fewer.";
  }

  if (!form.launchDate) {
    errors.launchDate = "Launch date is required.";
  } else {
    const selected = new Date(form.launchDate);
    if (isNaN(selected.getTime())) {
      errors.launchDate = "Enter a valid date.";
    }
  }

  return errors;
}

// ── FieldWrapper ───────────────────────────────────────────────────────────
function FieldWrapper({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
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
          <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}

// ── InputField ─────────────────────────────────────────────────────────────
function InputField({
  hasError,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      className={`
        w-full rounded-md px-3 py-2 text-xs bg-white border
        placeholder-slate-300 text-slate-800 outline-none transition-all duration-200
        focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
        ${
          hasError
            ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
            : "border-slate-200 hover:border-slate-300"
        } ${className}
      `}
      {...rest}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AddProductPage() {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    brandId: "",
    subCategoryId: "",
    productCode: "",
    description: "",
    launchDate: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ProductForm, boolean>>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brandIdList, setbrandIdList] = useState<Brand[]>([]);
  const [sctgryList, setSctgryList] = useState<Brand[]>([]);

  useEffect(() => {
    async function blist() {
      let data = await fetch("/api/brandsList");
      let finalData = await data.json();
      console.log(finalData);
      setbrandIdList(finalData.data);
    }
    async function sclist() {
      let data = await fetch("/api/subCategoryList");
      let finalData = await data.json();
      console.log(finalData);
      setSctgryList(finalData.data);
    }
    blist();
    sclist();
  }, []);

  const charLeft = 1000 - form.description.length;

  function handleChange<K extends keyof ProductForm>(key: K, value: string) {
    const updatedForm = { ...form, [key]: value };
    setForm(updatedForm);
    if (touched[key]) {
      setErrors(validate(updatedForm));
    }
    setSaved(false);
  }

  function handleBlur(key: keyof ProductForm) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setForm((currentForm) => {
      setErrors(validate(currentForm));
      return currentForm;
    });
  }

  async function handleSave() {
    const allTouched = Object.fromEntries(
      (Object.keys(form) as (keyof ProductForm)[]).map((k) => [k, true])
    ) as Record<keyof ProductForm, boolean>;
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setSaving(true);
      console.log(form);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === true) {
        handleReset();
        setSaved(true);
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch (error: any) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm({ name: "", brandId: "", subCategoryId: "", productCode: "", description: "", launchDate: "" });
    setErrors({});
    setTouched({});
    setSaved(false);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
      <div className="mx-auto max-w-3xl">

        {/* ── Page header ── */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Add Product
            </h1>
            <p className="text-xs text-slate-500">
              Fill in all required fields to register a new product.
            </p>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

          {/* ── Section: Identity ── */}
          <div className="px-6 py-5 border-b border-slate-100">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.9"/>
                  <rect x="7" y="1" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.5"/>
                  <rect x="1" y="7" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.5"/>
                  <rect x="7" y="7" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.9"/>
                </svg>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                Product Identity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Product Name — full width */}
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

              {/* Brand */}
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
                    {brandIdList.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </FieldWrapper>

              {/* Sub Category */}
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
                    {sctgryList.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </FieldWrapper>

              {/* Product Code */}
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

          {/* ── Section: Details ── */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                Product Details
              </span>
            </div>

            <div className="flex flex-col gap-4">

              {/* Description */}
              <FieldWrapper label="Description" required error={touched.description ? errors.description : undefined}>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  placeholder="Describe the product — ingredients, benefits, usage instructions, available variants…"
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

              {/* Launch Date */}
              <div className="sm:w-1/2">
                <FieldWrapper
                  label="Launch Date"
                  required
                  error={touched.launchDate ? errors.launchDate : undefined}
                  hint="The date this product will be or was launched to market"
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

          {/* ── Validation summary ── */}
          {errorCount > 0 && Object.keys(touched).length >= 6 && (
            <div className="flex items-center gap-2 mx-6 mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-[10px] font-semibold text-red-500">
                Please fix {errorCount} error{errorCount > 1 ? "s" : ""} before saving.
              </p>
            </div>
          )}

          {/* ── Footer actions ── */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear all
            </button>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Product saved successfully!
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`
                  flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold
                  transition-all duration-200 shadow-sm
                  ${saving
                    ? "bg-emerald-300 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-emerald-200"
                  }
                `}
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
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}