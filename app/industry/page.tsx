"use client"
import { useState, ChangeEvent, FocusEvent } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FormValues {
  name: string;
  code: string;
  description: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  description?: string;
}

type FieldName = keyof FormValues;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const INITIAL_VALUES: FormValues = {
  name: "",
  code: "",
  description: "",
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────
// Rules derived from example data:
//   name        → "Food & Beverages"  — letters, spaces, &, hyphens, apostrophes; required; 2–100 chars
//   code        → "FB"                — 2–10 uppercase letters/digits only; optional but auto-uppercased
//   description → free text sentence  — optional; max 500 chars

function validateField(field: FieldName, value: string): string {
  const v = value.trim();

  switch (field) {
    case "name":
      if (!v) return "Industry name is required.";
      if (v.length < 2) return "Must be at least 2 characters.";
      if (v.length > 100) return "Must be 100 characters or fewer.";
      if (!/^[a-zA-Z0-9\s&\-'().]+$/.test(v))
        return "Only letters, numbers, spaces, and & - ' ( ) allowed.";
      return "";

    case "code":
      if (!v) return "Industry code is required."
      if (v.length < 2) return "Code must be at least 2 characters.";
      if (v.length > 10) return "Code must be 10 characters or fewer.";
      if (!/^[A-Z0-9]+$/.test(v))
        return "Only uppercase letters and digits allowed (e.g. FB).";
      return "";

    case "description":
      if (!v) return "";                                    // optional
      if (v.length < 5) return "Description must be at least 5 characters.";
      if (v.length > 500) return "Must be 500 characters or fewer.";
      return "";

    default:
      return "";
  }
}

function validateAll(values: FormValues): FormErrors {
  return {
    name: validateField("name", values.name),
    code: validateField("code", values.code),
    description:  validateField("description",  values.description),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────

function calcProgress(values: FormValues): number {
  let score = 0;
  if (values.name.trim() && !validateField("name", values.name)) score += 50;
  if (values.code.trim() && !validateField("code", values.code)) score += 25;
  if (values.description.trim() && !validateField("description", values.description)) score += 25;
  else if (!values.description.trim()) score += 8;
  return Math.min(100, Math.round(score));
}

// ─── ICON ────────────────────────────────────────────────────────────────────

function Icon({ d, size = 15, sw = 1.7 }: { d: string[]; size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICONS = {
  industry: [
    "M2 20h20",
    "M4 20V10l8-8 8 8v10",
    "M10 20v-6h4v6",
    "M4 15h4M16 15h4",
  ],
  code: ["M9 12h6", "M8 8h.01M16 8h.01", "M3 6h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"],
  doc:  [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8M16 17H8M10 9H8",
  ],
  save: [
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",
    "M17 21v-8H7v8",
    "M7 3v5h8",
  ],
  x:     ["M18 6L6 18", "M6 6l12 12"],
  check: ["M20 6L9 17l-5-5"],
  alert: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  info:  [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01",
  ],
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function RequiredStar() {
  return <span className="text-red-500 text-[13px] leading-none font-semibold">*</span>;
}

function OptionalBadge() {
  return (
    <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
      Optional
    </span>
  );
}

function CheckMark() {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
      <Icon d={ICONS.check} size={14} sw={2.2} />
    </span>
  );
}

interface FieldWrapperProps {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ id, label, required, optional, hint, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 select-none"
      >
        {label}
        {required && <RequiredStar />}
        {optional && <OptionalBadge />}
      </label>

      {children}

      {hint && !error && (
        <p className="text-[11px] font-mono text-slate-400">{hint}</p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-[11px] text-red-600 animate-in fade-in slide-in-from-top-1 duration-150">
          <Icon d={ICONS.alert} size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// Input state → className
function inputCls(state: "error" | "ok" | "", extra = ""): string {
  const base =
    "w-full bg-slate-50 border rounded-lg text-sm text-slate-800 " +
    "placeholder:text-slate-300 placeholder:text-[13px] outline-none " +
    "transition-all duration-200 pl-10 pr-3 py-2.5 font-sans " +
    "hover:bg-white hover:border-slate-300";
  const map: Record<string, string> = {
    error: "border-red-400 ring-2 ring-red-400/10 bg-red-50 hover:!bg-red-50 hover:!border-red-400",
    ok:    "border-emerald-400 ring-2 ring-emerald-400/10 bg-white hover:!bg-white hover:!border-emerald-400",
    "":    "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white",
  };
  return `${base} ${map[state] ?? map[""]} ${extra}`;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border border-green-200 rounded-xl px-5 py-4 shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-300 min-w-[250px] max-w-[300px]"
    >
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

export default function AddIndustryPage() {
  const [values, setValues]     = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [touched, setTouched]   = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState<{ title: string; subtitle: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const progress = calcProgress(values);

  // ── helpers ────────────────────────────────────────────────────────────
  const fieldState = (field: FieldName): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (errors[field]) return "error";
    if (values[field].trim()) return "ok";
    return "";
  };

  const showToast = (title: string, subtitle: string) => {
    setToast({ title, subtitle });
    setTimeout(() => setToast(null), 4000);
  };

  // ── handlers ───────────────────────────────────────────────────────────
  const handleChange =
    (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      // Auto-uppercase the code field; strip illegal characters live
      if (field === "code") {
        val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      }
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) {
        setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
      }
    };

  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
    };

  const handleSubmit = async () => {
    setTouched({ name: true, code: true, description: true });
    const newErrors = validateAll(values);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      setStatusMsg("Please fix the errors above before saving.");
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }

    setLoading(true);
    // Simulate API POST — replace with real fetch to your backend
    await new Promise<void>((r) => setTimeout(r, 1400));
    setLoading(false);
     console.log(values)
          let res=await fetch('/api/industry',{
        'method':'post',
        'headers':{
            'Content-Type':'application/json',

        },
        'body':JSON.stringify(values)
       })
       let data=await res.json()
      if(data.status==true)
      {
          showToast("Industry saved!", `"${values.name.trim()}" has been added.`);
          handleReset();
      }
   
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setStatusMsg("");
  };

  const descLen  = values.description.length;
  const descOver = descLen > 500;

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── BRAND STRIP (no nav) ──────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-6 py-4 bg-white border-b border-slate-200">
        <span className="text-[14px] font-semibold text-slate-800 tracking-wider">BOXAIO</span>
      </div>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[680px] mx-auto w-full px-5 pt-9 pb-20">


        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-medium text-slate-800 tracking-tight">Add industry</h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Define a new industry to classify your product catalog
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

        {/* ── FORM CARD ─────────────────────────────────────────────── */}
        <div className="relative bg-white border border-slate-200 rounded-xl px-8 py-7 overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Industry details
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="flex flex-col gap-5">

            {/* ── Industry Name ─────────────────────────────────────── */}
            <FieldWrapper
              id="name"
              label="Industry name"
              required
              error={touched.name ? errors.name : undefined}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                  <Icon d={ICONS.industry} size={15} />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Food & Beverages"
                  value={values.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  className={inputCls(fieldState("name"))}
                  maxLength={100}
                  autoComplete="off"
                  spellCheck={false}
                />
                {fieldState("name") === "ok" && <CheckMark />}
              </div>
            </FieldWrapper>

            {/* ── Industry Code ─────────────────────────────────────── */}
            <FieldWrapper
              id="code"
              label="Industry code"
              required
              hint={
                values.code.length > 0 && values.code.length < 10
                  ? `${values.code.length} / 10 chars · uppercase letters & digits only`
                  : "2–10 uppercase letters & digits · e.g. FB"
              }
              error={touched.code ? errors.code : undefined}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                  <Icon d={ICONS.code} size={15} />
                </span>
                <input
                  id="code"
                  type="text"
                  placeholder="e.g. FB"
                  value={values.code}
                  onChange={handleChange("code")}
                  onBlur={handleBlur("code")}
                  className={inputCls(fieldState("code"), "font-mono tracking-[.08em] uppercase")}
                  maxLength={10}
                  autoComplete="off"
                  spellCheck={false}
                />
                {fieldState("code") === "ok" && <CheckMark />}
              </div>
            </FieldWrapper>

            {/* ── Description ───────────────────────────────────────── */}
            <FieldWrapper
              id="description"
              label="Description"
              optional
              error={touched.description ? errors.description : undefined}
            >
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-300 pointer-events-none">
                  <Icon d={ICONS.doc} size={15} />
                </span>
                <textarea
                  id="description"
                  placeholder="e.g. All consumable food and drink products"
                  value={values.description}
                  onChange={handleChange("description")}
                  onBlur={handleBlur("description")}
                  rows={4}
                  className={inputCls(fieldState("description"), "resize-none pt-2.5 pb-7 leading-relaxed")}
                  maxLength={520}
                />
                <span
                  className={`absolute right-2.5 bottom-2.5 text-[10px] font-mono pointer-events-none ${
                    descOver ? "text-red-500" : "text-slate-300"
                  }`}
                >
                  {descLen} / 500
                </span>
              </div>
            </FieldWrapper>

          </div>{/* /fields */}

          {/* ── ACTIONS ───────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 mt-7 pt-6 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[14px] px-6 py-2.5 rounded-lg shadow-sm shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-px transition-all duration-150"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <Icon d={ICONS.save} size={15} />
                  Save industry
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1.5 bg-transparent text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-normal text-[14px] px-5 py-2.5 rounded-lg transition-all duration-150"
            >
              <Icon d={ICONS.x} size={13} sw={2} />
              Cancel
            </button>
          </div>
        </div>{/* /card */}

        {/* Status error strip */}
        {statusMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs"
          >
            <Icon d={ICONS.info} size={14} />
            {statusMsg}
          </div>
        )}
      </main>

      {/* ── TOAST ─────────────────────────────────────────────────────── */}
      {toast && <Toast title={toast.title} subtitle={toast.subtitle} />}
    </div>
  );
}