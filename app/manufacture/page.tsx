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

// ─── PROGRESS HELPER ──────────────────────────────────────────────────────────

function calcProgress(values: FormValues): number {
  let filled = 0;
  if (values.companyName.trim() && !validateField("companyName", values.companyName)) filled++;
  if (values.gstNumber.trim()   && !validateField("gstNumber",   values.gstNumber))   filled++;
  if (values.address.trim()     && !validateField("address",     values.address))      filled++;
  return Math.min(100, Math.round((filled / 3) * 100));
}

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────

function FieldWrapper({
  label, required, hint, error, children,
}: {
  label: string; required?: boolean; hint?: string;
  error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
        {label}
        {required && <span className="ml-1 text-emerald-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400 font-mono">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
          <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border border-emerald-200 rounded-xl px-5 py-4 shadow-xl"
      style={{ animation: "toastIn 0.25s ease-out" }}
    >
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AddManufacturerPage() {
  const [values, setValues]       = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [touched, setTouched]     = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState("");
  const [toast, setToast]         = useState<{ title: string; subtitle: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const progress = calcProgress(values);

  // ── helpers ───────────────────────────────────────────────────────────────

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
    const base = "w-full bg-white border rounded-md px-3 py-2 text-xs placeholder-slate-300 text-slate-800 outline-none transition-all duration-200";
    const states: Record<string, string> = {
      error: "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400",
      ok:    "border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400",
      "":    "border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400",
    };
    return `${base} ${states[state] ?? states[""]} ${extra}`;
  };

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleChange =
    (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (field === "gstNumber") {
        val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
      }
      setValues((prev) => ({ ...prev, [field]: val }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, values[field]),
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");

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
    } catch (error: any) {
      console.log(error.messages);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 font-sans">

      <div className="mx-auto max-w-2xl">

        {/* Page header — matches Manufacturers list page */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Add Manufacturer
            </h1>
            <p className="text-xs text-slate-500">BOXAIO — Register a new manufacturer in your product catalog</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 flex-shrink-0">
            <span className="text-emerald-500 text-sm leading-none">*</span> Required
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Form Completion</p>
            <p className="text-[10px] font-bold text-emerald-600">{progress}%</p>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"/><path d="M9 21V7l6-4v18"/><path d="M9 11h6M9 15h6"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Manufacturer Details</h2>
              <p className="text-[10px] text-slate-400 font-medium">Fill in all required fields to register</p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Section divider */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100"/>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">Company Information</span>
                <div className="h-px flex-1 bg-slate-100"/>
              </div>

              {/* Company Name */}
              <FieldWrapper
                label="Company Name"
                required
                error={touched.companyName ? errors.companyName : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"/><path d="M9 21V7l6-4v18"/><path d="M9 11h6M9 15h6"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter company name"
                    value={values.companyName}
                    onChange={handleChange("companyName")}
                    onBlur={handleBlur("companyName")}
                    className={inputCls("companyName", "pl-9 pr-8")}
                    maxLength={100}
                    autoComplete="organization"
                    spellCheck={false}
                  />
                  {fieldState("companyName") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </span>
                  )}
                </div>
              </FieldWrapper>

              {/* GST Number */}
              <FieldWrapper
                label="GST Number"
                required
                hint={values.gstNumber.length === 15 ? undefined : "15-char alphanumeric GSTIN · e.g. 29ABCDE1234F1Z5"}
                error={touched.gstNumber ? errors.gstNumber : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 9h16M4 15h16M10 3l-4 18M14 3l-4 18"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="gstNumber"
                    placeholder="29ABCDE1234F1Z5"
                    value={values.gstNumber}
                    onChange={handleChange("gstNumber")}
                    onBlur={handleBlur("gstNumber")}
                    className={inputCls("gstNumber", "pl-9 pr-8 font-mono tracking-widest uppercase")}
                    maxLength={15}
                    spellCheck={false}
                  />
                  {fieldState("gstNumber") === "ok" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </span>
                  )}
                </div>
              </FieldWrapper>

              {/* Address */}
              <FieldWrapper
                label="Address"
                required
                error={touched.address ? errors.address : undefined}
              >
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-300 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <textarea
                    name="address"
                    rows={4}
                    placeholder="Enter manufacturer address"
                    value={values.address}
                    onChange={handleChange("address")}
                    onBlur={handleBlur("address")}
                    className={inputCls("address", "pl-9 pr-3 resize-none pb-6 leading-relaxed")}
                    maxLength={270}
                  />
                  <span
                    className={`absolute right-2.5 bottom-2 text-[9px] font-mono pointer-events-none ${
                      addrLen > 250 ? "text-red-500" : "text-slate-300"
                    }`}
                  >
                    {addrLen} / 250
                  </span>
                </div>
              </FieldWrapper>

              {/* Success banner */}
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[11px] font-semibold text-emerald-700">{success}</p>
                </div>
              )}

              {/* Status error strip */}
              {statusMsg && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[10px] font-medium text-red-600 leading-relaxed">{statusMsg}</p>
                </div>
              )}

            </div>

            {/* Footer actions — matches modal footer pattern */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm
                  ${loading
                    ? "bg-emerald-300 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-emerald-200"
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>
                    </svg>
                    Save Manufacturer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast title={toast.title} subtitle={toast.subtitle} />}
    </div>
  );
}