"use client"

import { useState, ChangeEvent, FocusEvent } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FormValues {
  companyName: string;
  gstNumber: string;
  address: string;
}

interface FormErrors {
  companyName?: string;
  gstNumber?: string;
  address?: string;
}

type FieldName = keyof FormValues;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

const INITIAL_VALUES: FormValues = {
  companyName: "",
  gstNumber: "",
  address: "",
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────
// Logic from user's code — messages & rules kept exactly as written

function validateField(field: FieldName, value: string): string {
  const v = value.trim();

  switch (field) {
    case "companyName": {
      if (!v) return "Company Name is required";
      if (v.length < 3) return "Minimum 3 characters required";
      if (v.length > 100) return "Maximum 100 characters allowed";
      if (!/^[A-Za-z0-9&.\-\s]+$/.test(v)) return "Invalid company name";
      return "";
    }

    case "gstNumber": {
      if (!v) return "GST must be required";
      if (v.length !== 15) return "GST must contain 15 characters";
      if (!GST_REGEX.test(v.toUpperCase())) return "Invalid GST format";
      return "";
    }

    case "address": {
      if (!v) return "Address is required";
      if (v.length < 10) return "Address must contain minimum 10 characters";
      if (v.length > 250) return "Address cannot exceed 250 characters";
      return "";
    }

    default:
      return "";
  }
}

function validateAll(values: FormValues): FormErrors {
  return {
    companyName: validateField("companyName", values.companyName),
    gstNumber:   validateField("gstNumber",   values.gstNumber),
    address:     validateField("address",     values.address),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// ─── PROGRESS HELPER ─────────────────────────────────────────────────────────

function calcProgress(values: FormValues): number {
  let filled = 0;
  if (values.companyName.trim() && !validateField("companyName", values.companyName)) filled++;
  if (values.gstNumber.trim()   && !validateField("gstNumber",   values.gstNumber))   filled++;
  if (values.address.trim()     && !validateField("address",     values.address))      filled++;
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
  building: ["M3 21h18", "M9 21V7l6-4v18", "M9 11h6M9 15h6"],
  hash: ["M4 9h16", "M4 15h16", "M10 3l-4 18", "M14 3l-4 18"],
  mapPin: [
    "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z",
    "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
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

export default function AddManufacturerPage() {
  const [values, setValues]     = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [touched, setTouched]   = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [toast, setToast]       = useState<{ title: string; subtitle: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const progress = calcProgress(values);

  // ── helpers ──────────────────────────────────────────────────────────────

  const showToast = (title: string, subtitle: string) => {
    setToast({ title, subtitle });
    setTimeout(() => setToast(null), 4000);
  };

  const fieldState = (field: FieldName): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (errors[field]) return "error";
    if (values[field].trim()) return "ok";
    return "";
  };

  const inputCls = (field: FieldName, extra = ""): string => {
    const state = fieldState(field);
    const base =
      "w-full bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-300 placeholder:text-[13px] outline-none transition-all duration-200 pl-10 pr-3 py-2.5 font-sans hover:bg-white hover:border-slate-300";
    const states: Record<string, string> = {
      error: "border-red-400 ring-2 ring-red-400/10 bg-red-50 hover:bg-red-50",
      ok:    "border-emerald-400 ring-2 ring-emerald-400/10 bg-white hover:bg-white",
      "":    "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white",
    };
    return `${base} ${states[state] ?? states[""]} ${extra}`;
  };

  // ── handlers (from user's code logic) ────────────────────────────────────

  // onChange: clears that field's error immediately (user's pattern),
  // plus auto-sanitise GST field
  const handleChange =
    (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (field === "gstNumber") {
        val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
      }
      setValues((prev) => ({ ...prev, [field]: val }));
      // Clear error on change (user's code: setErrors prev [name]: "")
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  // onBlur: mark touched and run live validation
  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, values[field]),
      }));
    };

  // onSubmit: validate all, call API, handle success/failure (user's flow)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");

    // Mark all touched for visual feedback
    setTouched({ companyName: true, gstNumber: true, address: true });
    const newErrors = validateAll(values);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      setStatusMsg("Please fix the errors above before saving.");
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }

    setLoading(true);

    try {
      // Simulate 1 s delay then POST (user's fetch logic)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await fetch("/api/manufacturer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: values.companyName.trim(),
          gstNumber:   values.gstNumber.trim().toUpperCase(),
          address:     values.address.trim(),
        }),
      });

      const data = await res.json();

      if (data.status === true) {
        setSuccess("Manufacturer added successfully");
        showToast(
          "Manufacturer saved!",
          `"${values.companyName.trim()}" has been added to your catalog.`
        );
        handleReset();
      }
    } catch(error:any) {
      console.log(error.messages)
      alert("Failed to save manufacturer");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched({});
    setErrors({});
    setSuccess("");
    setStatusMsg("");
  };

  const addrLen = values.address.length;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[700px] mx-auto w-full px-6 pt-9 pb-20">

        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-medium text-slate-800 tracking-tight">Add manufacturer</h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Register a new manufacturer in your product catalog
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
          {/* Top accent */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Manufacturer details
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">

              {/* ── Company Name ─────────────────────────────── */}
              <FieldWrapper
                label="Company name"
                required
                error={touched.companyName ? errors.companyName : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.building} size={15} />
                  </span>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter company name"
                    value={values.companyName}
                    onChange={handleChange("companyName")}
                    onBlur={handleBlur("companyName")}
                    className={inputCls("companyName")}
                    maxLength={100}
                    autoComplete="organization"
                    spellCheck={false}
                  />
                  {fieldState("companyName") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Icon d={ICONS.check} size={14} sw={2.2} />
                    </span>
                  )}
                </div>
              </FieldWrapper>

              {/* ── GST Number ───────────────────────────────── */}
              <FieldWrapper
                label="GST number"
                required
                hint={
                  values.gstNumber.length === 15
                    ? undefined
                    : "15-character alphanumeric GSTIN · e.g. 29ABCDE1234F1Z5"
                }
                error={touched.gstNumber ? errors.gstNumber : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.hash} size={15} />
                  </span>
                  <input
                    type="text"
                    name="gstNumber"
                    placeholder="29ABCDE1234F1Z5"
                    value={values.gstNumber}
                    onChange={handleChange("gstNumber")}
                    onBlur={handleBlur("gstNumber")}
                    className={inputCls("gstNumber", "font-mono tracking-widest uppercase")}
                    maxLength={15}
                    spellCheck={false}
                  />
                  {fieldState("gstNumber") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Icon d={ICONS.check} size={14} sw={2.2} />
                    </span>
                  )}
                </div>
              </FieldWrapper>

              {/* ── Address ──────────────────────────────────── */}
              <FieldWrapper
                label="Address"
                required
                error={touched.address ? errors.address : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.mapPin} size={15} />
                  </span>
                  <textarea
                    name="address"
                    rows={4}
                    placeholder="Enter manufacturer address"
                    value={values.address}
                    onChange={handleChange("address")}
                    onBlur={handleBlur("address")}
                    className={inputCls("address", "resize-none pt-2.5 pb-7 leading-relaxed")}
                    maxLength={270}
                  />
                  <span
                    className={`absolute right-2.5 bottom-2.5 text-[10px] font-mono pointer-events-none ${
                      addrLen > 250 ? "text-red-500" : "text-slate-300"
                    }`}
                  >
                    {addrLen} / 250
                  </span>
                </div>
              </FieldWrapper>

            </div>

            {/* ── Success banner (user's pattern) ──────────── */}
            {success && (
              <div className="mt-5 bg-green-100 text-green-700 text-sm px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* ── ACTIONS ──────────────────────────────────── */}
            <div className="flex items-center gap-2.5 mt-7 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[14px] px-6 py-2.5 rounded-lg shadow-sm shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-px transition-all duration-150"
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
                    Save Manufacturer
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex items-center gap-1.5 bg-transparent text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-normal text-[14px] px-5 py-2.5 rounded-lg transition-all duration-150"
              >
                <Icon d={ICONS.x} size={13} sw={2} />
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Status error strip */}
        {statusMsg && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
            <Icon d={ICONS.info} size={14} />
            {statusMsg}
          </div>
        )}
      </main>

      {/* ── TOAST ───────────────────────────────────────────────── */}
      {toast && <Toast title={toast.title} subtitle={toast.subtitle} />}
    </div>
  );
}