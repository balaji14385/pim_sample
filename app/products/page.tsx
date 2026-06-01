"use client"
import { useState,useEffect } from "react";

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
interface brand{
  id:string;
  name:string;
}

// ── Constants ─────────────────────────────────────────────────────────────
const  subCategoryIdList = [
  "Shampoo",
  "Conditioner",
  "Hair Oil",
  "Face Wash",
  "Soap",
  "Body Lotion",
  "Toothpaste",
  "Hair Serum",
];
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
    errors.brandId= "Please select a brand.";
  }
  if (!form. subCategoryId) {
  errors. subCategoryId = "Please select a sub category.";
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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full border border-red-400 flex items-center justify-center text-[9px] leading-none font-bold">
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
  value,
  onChange,
  placeholder,
  hasError,
  maxLength,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`
        w-full rounded-lg px-4 py-2.5 text-sm bg-white border
        placeholder-slate-300 text-slate-800 outline-none transition-all duration-200
        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
        ${hasError
          ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
          : "border-slate-200 hover:border-slate-300"
        }
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
  const [brandIdList,setbrandIdList]=useState<brand[]>([])
  const [sctgryList,setSctgryList]=useState<brand[]>([])
    useEffect(()=>{
  
       async function blist(){
         let data= await fetch('/api/brandsList')
         let finalData=await data.json()
            console.log(finalData)
          setbrandIdList(finalData.data)
               }
        async function sclist(){
         let data= await fetch('/api/subCategoryList')
         let finalData=await data.json()
            console.log(finalData)
          setSctgryList(finalData.data)
               }
       blist()
       sclist()
    },[]);  
  const charLeft = 1000 - form.description.length;

function handleChange<K extends keyof ProductForm>(
  key: K,
  value: string
) {
  const updatedForm = {
    ...form,
    [key]: value,
  };

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.status === true) {
      handleReset();
      setSaved(true);
    } else {
      alert(data.message || "Failed to save product");
    }
  } catch (error:any) {
    console.error(error);
    alert("Something went wrong");
  } finally {
    setSaving(false);
  }
}

  function handleReset() {
    setForm({ name: "", brandId: "",   subCategoryId: "",
    productCode: "", description: "", launchDate: "" });
    setErrors({});
    setTouched({});
    setSaved(false);
  }

  const NAV_ITEMS = ["Dashboard", "Products", "Categories", "brandIdIds", "Reports"];

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >

      {/* ── Main ── */}
      <main className="flex-1 px-4 sm:px-8 py-8 max-w-3xl mx-auto w-full">

        {/* Page title */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Add Product</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Fill in all required fields to register a new product in BOXAIO PIM.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">

          {/* ── Section: Identity ── */}
          <div className="px-6 sm:px-8 py-7">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.9"/>
                  <rect x="7" y="1" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.5"/>
                  <rect x="1" y="7" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.5"/>
                  <rect x="7" y="7" width="4" height="4" rx="0.7" fill="currentColor" opacity="0.9"/>
                </svg>
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-slate-500">
                Product Identity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Product Name — full width */}
              <div className="md:col-span-2">
                <FieldWrapper
                  label="Product Name"
                  required
                  error={touched.name ? errors.name : undefined}
                >
                  <InputField
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Clinic Plus Strong & Long Shampoo 340ml"
                    hasError={!!(touched.name && errors.name)}
                    maxLength={120}
                  />
                  <div className="flex justify-end mt-0.5">
                    <span className={`text-[10px] font-medium ${form.name.length > 100 ? "text-orange-400" : "text-slate-300"}`}>
                      {form.name.length}/120
                    </span>
                  </div>
                </FieldWrapper>
              </div>

              {/* brandId */}
              <FieldWrapper
                label="brand"
                required
                error={touched.brandId ? errors.brandId : undefined}
              >
                <div className="relative">
                  <select
                    value={form.brandId}
                    onChange={(e) => handleChange("brandId", e.target.value)}
                    onBlur={() => handleBlur("brandId")}
                    className={`
                      w-full appearance-none rounded-lg px-4 py-2.5 text-sm bg-white border
                      outline-none transition-all duration-200 cursor-pointer
                      focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${touched.brandId && errors.brandId
                        ? "border-red-300 bg-red-50 text-slate-400"
                        : form.brandId
                          ? "border-slate-200 text-slate-800 hover:border-slate-300"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"
                      }
                    `}
                  >
                    <option value="" disabled>Select a brandId…</option>
                   {
   brandIdList.map((e)=>{

    return <option key={e.id} value={e.id}>{e.name}</option>
   })
}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </FieldWrapper>
              <FieldWrapper
  label="Sub Category"
  required
  error={touched. subCategoryId ? errors. subCategoryId : undefined}
>
  <div className="relative">
    <select
      value={form. subCategoryId}
      onChange={(e) => handleChange("subCategoryId", e.target.value)}
      onBlur={() => handleBlur("subCategoryId")}
      className={`
        w-full appearance-none rounded-lg px-4 py-2.5 text-sm bg-white border
        outline-none transition-all duration-200 cursor-pointer
        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
        ${
          touched. subCategoryId && errors. subCategoryId
            ? "border-red-300 bg-red-50 text-slate-400"
            : form. subCategoryId
            ? "border-slate-200 text-slate-800 hover:border-slate-300"
            : "border-slate-200 text-slate-400 hover:border-slate-300"
        }
      `}
    >
      <option value="" disabled>
        Select a sub category...
      </option>

     {
   sctgryList.map((e)=>{

    return <option key={e.id} value={e.id}>{e.name}</option>
   })
}
    </select>

    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg
        className="w-4 h-4 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </div>
</FieldWrapper>
              {/* Product Code */}
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

          {/* ── Section: Details ── */}
          <div className="px-6 sm:px-8 py-7">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-md bg-slate-700 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-slate-500">
                Product Details
              </span>
            </div>

            <div className="flex flex-col gap-5">

              {/* Description */}
              <FieldWrapper
                label="Description"
                required
                error={touched.description ? errors.description : undefined}
              >
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  placeholder="Describe the product — ingredients, benefits, usage instructions, available variants…"
                  rows={5}
                  maxLength={1000}
                  className={`
                    w-full rounded-lg px-4 py-2.5 text-sm bg-white border resize-none
                    placeholder-slate-300 text-slate-800 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                    ${touched.description && errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                />
                <div className="flex justify-end">
                  <span className={`text-[10px] font-medium ${charLeft < 50 ? "text-red-400" : charLeft < 150 ? "text-orange-400" : "text-slate-300"}`}>
                    {charLeft} characters remaining
                  </span>
                </div>
              </FieldWrapper>

              {/* Launch Date */}
              <div className="md:w-1/2">
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

          {/* ── Validation summary (if any errors on submit) ── */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length === 6 && (
            <div className="px-6 sm:px-8 py-4 bg-red-50 border-t border-red-100">
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} before saving.
              </p>
            </div>
          )}

          {/* ── Footer actions ── */}
          <div className="px-6 sm:px-8 py-5 bg-slate-50/70 rounded-b-2xl flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              Clear all
            </button>

            <div className="flex items-center gap-4">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
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
                  flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold
                  transition-all duration-200 shadow-sm
                  ${saving
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200 hover:shadow-blue-300"
                  }
                `}
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M13 4.5L6.5 11 3 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}