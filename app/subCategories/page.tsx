"use client"

import { useState,useEffect, useRef, ChangeEvent, FocusEvent } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FormValues {
  categoryId: string;
  name: string;
  code: string;
}
interface FormErrors {
  categoryId?: string;
  name?: string;
  code?: string;
}
type FieldName = keyof FormValues;
interface industry{
  id:string;
  name:string;
}
// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CODE_REGEX = /^[A-Z0-9_-]{3,20}$/;


const INITIAL_VALUES: FormValues = {
  categoryId: "",
  name: "",
  code: "",
};
const categoryId_OPTIONS = [
  "Electronics",
  "Fashion",
  "Grocery",
  "Furniture",
  "Pharmaceutical",
  "Automotive",
  "Food & Beverage",
  "Beauty",
  "Sports",
  "Others",
];

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateField(
  field: FieldName,
  value: string | File | null
): string {
  const v = (value as string).trim();

  switch (field) {
    case "categoryId": {
      if (!v) return "Please select an industry";
      return "";
    }

    case "name": {
      if (!v) return "Category Name is required";

      if (v.length < 3)
        return "Minimum 3 characters required";

      if (v.length > 60)
        return "Maximum 60 characters allowed";

      if (!/^[A-Za-z0-9&.\-\s]+$/.test(v))
        return "Invalid category name";

      return "";
    }

    case "code": {
      if (!v)
        return "Category Code is required";

      if (v.length < 3)
        return "Code must contain minimum 3 characters";

      if (v.length > 20)
        return "Code cannot exceed 20 characters";

      if (!CODE_REGEX.test(v.toUpperCase()))
        return "Only A-Z, 0-9, _ and - allowed";

      return "";
    }

    default:
      return "";
  }
}

function validateAll(values: FormValues): FormErrors {
  return {
    categoryId: validateField("categoryId", values.categoryId),
    name: validateField("name", values.name),
    code: validateField("code", values.code),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function calcProgress(values: FormValues): number {
  let filled = 0;
  if (values.categoryId.trim() && !validateField("categoryId", values.categoryId)) filled++;
  if (values.name.trim() && !validateField("name", values.name)) filled++;
  if (values.code.trim() && !validateField("code", values.code)) filled++;
  return Math.min(100, Math.round((filled / 3) * 100));
}

// ─── ICON ────────────────────────────────────────────────────────────────────
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
  tag: [
    "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
    "M7 7h.01",
  ],
  briefcase: [
    "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z",
    "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  ],
  hash: ["M4 9h16", "M4 15h16", "M10 3l-4 18", "M14 3l-4 18"],
  upload: [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M17 8l-5-5-5 5",
    "M12 3v12",
  ],
  save: [
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",
    "M17 21v-8H7v8",
    "M7 3v5h8",
  ],
  x: ["M18 6L6 18", "M6 6l12 12"],
  check: ["M20 6L9 17l-5-5"],
  alert: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  info: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01",
  ],
  trash: [
    "M3 6h18",
    "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  ],
};

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
interface FieldWrapperProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, required, hint, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="text-red-500 text-sm leading-none normal-case">*</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] font-mono text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-600 animate-in fade-in slide-in-from-top-1 duration-150">
          <Icon d={ICONS.alert} size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border border-green-200 rounded-xl px-5 py-4 shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-300">
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
        <Icon d={ICONS.check} size={15} sw={2.2} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AddCategoryPage() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState<{ title: string; subtitle: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const[industry,setIndustry]=useState<industry[]>([])

  const progress = calcProgress(values);
    useEffect(()=>{
     async function indList(){
       let data= await fetch('/api/categoriesList')
       let finalData=await data.json()
        setIndustry(finalData.data)
  }
  indList()
},[])
  const showToast = (title: string, subtitle: string) => {
    setToast({ title, subtitle });
    setTimeout(() => setToast(null), 4000);
  };

  const fieldState = (field: FieldName): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (errors[field]) return "error";
    return "";
  };

  const inputCls = (field: FieldName, extra = ""): string => {
    const state = fieldState(field);
    const base =
      "w-full bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-300 placeholder:text-[13px] outline-none transition-all duration-200 pl-10 pr-3 py-2.5 font-sans hover:bg-white hover:border-slate-300";
    const states: Record<string, string> = {
      error: "border-red-400 ring-2 ring-red-400/10 bg-red-50 hover:bg-red-50",
      ok: "border-emerald-400 ring-2 ring-emerald-400/10 bg-white hover:bg-white",
      "": "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white",
    };
    return `${base} ${states[state] ?? states[""]} ${extra}`;
  };

const handleChange =
  (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (field === "code") {
        val = val.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20);
      }
      setValues((prev) => ({ ...prev, [field]: val }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

const handleBlur = (field: FieldName) => () => {
  setTouched((prev) => ({ ...prev, [field]: true }));
  setErrors((prev) => ({
    ...prev,
    [field]: validateField(field, values[field]),
  }));
};
  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched({});
    setErrors({});
    setSuccess("");
    setStatusMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setSuccess("");

  setTouched({
    categoryId: true,
    name: true,
    code: true,
  });

  const newErrors = validateAll(values);
  setErrors(newErrors);

  if (hasErrors(newErrors)) {
    setStatusMsg("Please fix the errors above before saving.");
    setTimeout(() => setStatusMsg(""), 3500);
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/subCategories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (data.status === true) {
      setSuccess("Category added successfully");

      showToast(
        "Category saved!",
        `"${values.name.trim()}" has been added to your catalog.`
      );

      handleReset();
    } else {
      showToast(
        "Category not saved!",
        data.message 
      );
    }
  } catch (error: any) {
    console.error(error);
showToast(
        "Category not saved!",
        error.message 
      );
      } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-[700px] mx-auto w-full px-6 pt-9 pb-20">
        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-medium text-slate-800 tracking-tight">
              Add sub category
            </h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Create a sub category to organize your products
            </p>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 flex-shrink-0">
            <span className="text-red-500 text-sm leading-none">*</span> Required
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="h-[3px] bg-slate-200 rounded-full mb-7 overflow-hidden"
          title={`${progress}% complete`}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <div className="relative bg-white border border-slate-200 rounded-xl px-8 py-7 overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Category details
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              {/* categoryId */}
              {/* categoryId */}
<FieldWrapper
  label="parent Category"
  required
  error={touched.categoryId ? errors.categoryId : undefined}
>
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none z-10">
      <Icon d={ICONS.briefcase} size={15} />
    </span>

    <select
      name="categoryId"
      value={values.categoryId}
      onChange={(e) => {
        setValues((prev) => ({
          ...prev,
          categoryId: e.target.value,
        }));

        setErrors((prev) => ({
          ...prev,
          categoryId: "",
        }));
      }}
      onBlur={handleBlur("categoryId")}
      className={inputCls(
        "categoryId",
        "appearance-none cursor-pointer"
      )}
    >
      <option value="">
        Select parent category
      </option>

        { industry && 
           industry.map((e)=>{

    return <option key={e.id} value={e.id}>{e.name}</option>
   })
}
    </select>

    {fieldState("categoryId") === "ok" && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
        <Icon
          d={ICONS.check}
          size={14}
          sw={2.2}
        />
      </span>
    )}
  </div>
</FieldWrapper>

              {/* Category Name */}
              <FieldWrapper
                label="Category name"
                required
                error={touched.name ? errors.name : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.tag} size={15} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter category name"
                    value={values.name}
                    onChange={handleChange("name")}
                    onBlur={handleBlur("name")}
                    className={inputCls("name")}
                    maxLength={60}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {fieldState("name") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Icon d={ICONS.check} size={14} sw={2.2} />
                    </span>
                  )}
                </div>
              </FieldWrapper>

              {/* Category Code */}
              <FieldWrapper
                label="Category code"
                required
                hint={
                  values.code.length >= 3
                    ? undefined
                    : "3–20 chars · A-Z, 0-9, _ and - · e.g. ELEC_01"
                }
                error={touched.code ? errors.code : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.hash} size={15} />
                  </span>
                  <input
                    type="text"
                    name="code"
                    placeholder="ELEC_01"
                    value={values.code}
                    onChange={handleChange("code")}
                    onBlur={handleBlur("code")}
                    className={inputCls("code", "font-mono tracking-widest uppercase")}
                    maxLength={20}
                    spellCheck={false}
                  />
                  {fieldState("code") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Icon d={ICONS.check} size={14} sw={2.2} />
                    </span>
                  )}
                </div>
              </FieldWrapper>

            </div>

            {success && (
              <div className="mt-5 bg-green-100 text-green-700 text-sm px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex items-center gap-2.5 mt-7 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium 
                md:text-[14px] md:px-5 md:py-2.5 text-[8px] px-3 py-2.5
                rounded-lg shadow-sm shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-px transition-all duration-150"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon d={ICONS.save} size={15} />
                    Save Category
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex items-center gap-1.5 bg-transparent text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-normal 
                text-[14px] px-5 py-2.5 rounded-lg transition-all duration-150"
              >
                <Icon d={ICONS.x} size={13} sw={2} />
                Cancel
              </button>
            </div>
          </form>
        </div>

        {statusMsg && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
            <Icon d={ICONS.info} size={14} />
            {statusMsg}
          </div>
        )}
      </main>

      {toast && <Toast title={toast.title} subtitle={toast.subtitle} />}
    </div>
  );
}