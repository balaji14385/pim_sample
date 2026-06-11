"use client"

import { useEffect, useMemo, useState, useCallback, ChangeEvent, FocusEvent } from "react";
import { useRouter } from "next/navigation";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ManufacturerRow = {
  id: string;
  companyName: string;
  gstNumber: string;
  address: string;
  brandCount: number;
  productName: string;
  createdAt: string;
};

type GroupedManufacturer = {
  id: string;
  companyName: string;
  gstNumber: string;
  address: string;
  brandCount: number;
  products: string[];
  createdAt: string;
};

interface EditFormValues {
  companyName: string;
  gstNumber: string;
  address: string;
}

interface EditFormErrors {
  companyName?: string;
  gstNumber?: string;
  address?: string;
}

type FieldName = keyof EditFormValues;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function validateField(field: FieldName, value: string): string {
  const v = value.trim();
  switch (field) {
    case "companyName": {
      if (!v) return "Company name is required";
      if (v.length < 3) return "Minimum 3 characters required";
      if (v.length > 100) return "Maximum 100 characters allowed";
      if (!/^[A-Za-z0-9&.\-\s]+$/.test(v)) return "Invalid company name";
      return "";
    }
    case "gstNumber": {
      if (!v) return "GST number is required";
      if (v.length !== 15) return "GST must be exactly 15 characters";
      if (!GST_REGEX.test(v.toUpperCase())) return "Invalid GST format";
      return "";
    }
    case "address": {
      if (!v) return "Address is required";
      if (v.length < 10) return "Address must be at least 10 characters";
      if (v.length > 250) return "Address cannot exceed 250 characters";
      return "";
    }
    default: return "";
  }
}

function validateAll(values: EditFormValues): EditFormErrors {
  return {
    companyName: validateField("companyName", values.companyName),
    gstNumber: validateField("gstNumber", values.gstNumber),
    address: validateField("address", values.address),
  };
}

function hasErrors(errors: EditFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
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

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  manufacturer,
  onCancel,
  onConfirmed,
}: {
  manufacturer: GroupedManufacturer;
  onCancel: () => void;
  onConfirmed: () => void;
}) {
  const [typedName, setTypedName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isMatch = typedName.trim() === manufacturer.companyName.trim();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  async function handleDelete() {
    if (!isMatch) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/manufacturer/${manufacturer.id}`, {
        method: "DELETE",
      });

      let data: any = {};
      try { data = await res.json(); } catch { /* non-JSON body */ }

      if (res.ok && data.status !== false) {
        onConfirmed();
      } else {
        setErrorMsg(
          data?.message ||
          `Delete failed (HTTP ${res.status}). Check that DELETE /api/manufacturer/[id] exists and handles cascade deletion.`
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message === "Failed to fetch"
          ? "Network error — could not reach the server."
          : `Unexpected error: ${err?.message ?? "unknown"}`
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.16s ease-out" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-red-50">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Delete Manufacturer</h2>
            <p className="text-[10px] text-slate-500">{manufacturer.companyName} · {manufacturer.gstNumber}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-slate-800">{manufacturer.companyName}</span>{" "}
            and cascade-delete all associated{" "}
            <span className="font-medium text-red-600">brands, products, product variants, SKUs, and SKU attribute values</span>.
          </p>

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
            <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1.5">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <path d="M12 9v4M12 17h.01"/>
              </svg>
              This action cannot be undone.
            </p>
          </div>

          {/* Retype field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
              Type the company name to confirm
              <span className="ml-1 text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Please type{" "}
              <span className="font-semibold text-slate-600 bg-slate-100 rounded px-1 py-0.5 font-mono text-[10px]">
                {manufacturer.companyName}
              </span>{" "}
              exactly to proceed.
            </p>
            <input
              type="text"
              value={typedName}
              onChange={(e) => { setTypedName(e.target.value); setErrorMsg(""); }}
              placeholder={`Type "${manufacturer.companyName}" here…`}
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

          {errorMsg && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-[10px] text-red-600 font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isMatch || deleting}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200
              ${!isMatch || deleting
                ? "bg-red-200 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm shadow-red-200"
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
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────

function EditManufacturerModal({
  manufacturer,
  onClose,
  onSaved,
}: {
  manufacturer: GroupedManufacturer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<EditFormValues>({
    companyName: manufacturer.companyName,
    gstNumber: manufacturer.gstNumber,
    address: manufacturer.address,
  });
  const [errors, setErrors] = useState<EditFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/manufacturer/${manufacturer.id}`);
        if (res.ok) {
          let data: any = {};
          try { data = await res.json();} catch { /* skip */ }
          const m = data?.data;
          if (m) {
            setValues({
              companyName: m.companyName ?? manufacturer.companyName,
              gstNumber:   m.gstNumber   ?? manufacturer.gstNumber,
              address:     m.address     ?? manufacturer.address,
            });
          }
        }
      } catch {
        // silently fall back to list-row data already in state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [manufacturer.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (field: FieldName) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (field === "gstNumber") {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    }
    setValues((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSaved(false);
    setApiError("");
  };

  const handleBlur = (field: FieldName) => (_: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
  };

  async function handleSave() {
    setTouched({ companyName: true, gstNumber: true, address: true });
    const errs = validateAll(values);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setSaving(true);
    setApiError("");
    console.log(values)
    try {
      const res = await fetch(`/api/manufacturer/${manufacturer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: values.companyName.trim(),
          gstNumber:   values.gstNumber.trim().toUpperCase(),
          address:     values.address.trim(),
        }),
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
      setApiError(err.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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

  const addrLen = values.address.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.17s ease-out" }}
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
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Manufacturer</h2>
              <p className="text-[10px] text-slate-400 font-medium">{manufacturer.gstNumber}</p>
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
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-6 h-6 text-emerald-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-xs text-slate-400">Loading manufacturer data…</span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100"/>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">Manufacturer Details</span>
                <div className="h-px flex-1 bg-slate-100"/>
              </div>

              {/* Company Name */}
              <FieldWrapper label="Company Name" required error={touched.companyName ? errors.companyName : undefined}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"/><path d="M9 21V7l6-4v18"/><path d="M9 11h6M9 15h6"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={values.companyName}
                    onChange={handleChange("companyName")}
                    onBlur={handleBlur("companyName")}
                    placeholder="Enter company name"
                    maxLength={100}
                    className={inputCls("companyName", "pl-9 pr-8")}
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
                    value={values.gstNumber}
                    onChange={handleChange("gstNumber")}
                    onBlur={handleBlur("gstNumber")}
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                    className={inputCls("gstNumber", "pl-9 pr-8 font-mono tracking-widest uppercase")}
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
              <FieldWrapper label="Address" required error={touched.address ? errors.address : undefined}>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-300 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <textarea
                    value={values.address}
                    onChange={handleChange("address")}
                    onBlur={handleBlur("address")}
                    placeholder="Enter manufacturer address"
                    rows={4}
                    maxLength={270}
                    className={inputCls("address", "pl-9 pr-3 resize-none pb-6 leading-relaxed")}
                  />
                  <span className={`absolute right-2.5 bottom-2 text-[9px] font-mono pointer-events-none ${addrLen > 250 ? "text-red-500" : "text-slate-300"}`}>
                    {addrLen} / 250
                  </span>
                </div>
              </FieldWrapper>

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
              disabled={saving || loading}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm
                ${saving || loading
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ManufacturersListPage() {
  const [rows, setRows] = useState<ManufacturerRow[]>([]);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [editingManufacturer, setEditingManufacturer] = useState<GroupedManufacturer | null>(null);
  const [deletingManufacturer, setDeletingManufacturer] = useState<GroupedManufacturer | null>(null);
  const router = useRouter();

  async function loadManufacturers() {
    try {
      const res = await fetch("/api/registeredManufacturer");
      if (!res.ok) throw new Error("Failed to fetch manufacturers");
      const data = await res.json();
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error(error);
      setRows([]);
    }
  }

  useEffect(() => { loadManufacturers(); }, []);

  const grouped = useMemo<GroupedManufacturer[]>(() => {
    const map = new Map<string, GroupedManufacturer>();
    for (const r of rows) {
      const key = `${r.companyName}|${r.gstNumber}`;
      const existing = map.get(key);
      if (existing) {
        const product = r.productName?.trim();
        if (product && !existing.products.includes(product)) {
          existing.products.push(product);
        }
        existing.brandCount = Math.max(existing.brandCount, Number(r.brandCount) || 0);
      } else {
        map.set(key, {
          id: r.id,
          companyName: r.companyName,
          gstNumber: r.gstNumber,
          address: r.address,
          brandCount: Number(r.brandCount) || 0,
          products: r.productName?.trim() ? [r.productName] : [],
          createdAt: r.createdAt,
        });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const companies = useMemo(
    () => Array.from(new Set(grouped.map((g) => g.companyName))).sort(),
    [grouped]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grouped.filter((g) => {
      const matchQ = !q ||
        g.companyName.toLowerCase().includes(q) ||
        g.gstNumber.toLowerCase().includes(q) ||
        g.address.toLowerCase().includes(q);
      const matchC = companyFilter === "all" || g.companyName === companyFilter;
      return matchQ && matchC;
    });
  }, [grouped, query, companyFilter]);

  const totalBrands = useMemo(() => grouped.reduce((a, g) => a + g.brandCount, 0), [grouped]);
  const totalProducts = useMemo(() => grouped.reduce((a, g) => a + g.products.length, 0), [grouped]);

  const handleEditSaved = useCallback(() => { loadManufacturers(); }, []);
  const handleDeleteConfirmed = useCallback(() => {
    setDeletingManufacturer(null);
    loadManufacturers();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">

      {/* Edit Modal */}
      {editingManufacturer && (
        <EditManufacturerModal
          manufacturer={editingManufacturer}
          onClose={() => setEditingManufacturer(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingManufacturer && (
        <DeleteConfirmModal
          manufacturer={deletingManufacturer}
          onCancel={() => setDeletingManufacturer(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}

      <div className="mx-auto max-w-full">
        {/* Page header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Manufacturers
            </h1>
            <p className="text-xs text-slate-500">BOXAIO — Manage and view all registered manufacturers</p>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 shadow-sm">
            <button
              className="cursor-pointer text-sm font-semibold"
              onClick={() => router.push("/manufacture")}
            >
              Add Manufacturer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Manufacturers</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{grouped.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brands</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalBrands}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Products</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalProducts}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, GST or address…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100"
          >
            <option value="all">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Company", "GST Number", "Address", "Brands", "Products", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-400">
                      No manufacturers found
                    </td>
                  </tr>
                )}
                {filtered.map((m) => (
                  <tr key={`${m.companyName}-${m.gstNumber}`} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow flex-shrink-0">
                          {initials(m.companyName)}
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-800">{m.companyName}</h3>
                          <p className="max-w-[160px] truncate text-[10px] text-slate-500">Since {formatDate(m.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">{m.gstNumber}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      <p className="max-w-[220px] truncate" title={m.address}>{m.address}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{m.brandCount}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex max-w-[240px] flex-wrap gap-1">
                        {m.products.slice(0, 3).map((p) => (
                          <span key={p} className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{p}</span>
                        ))}
                        {m.products.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">+{m.products.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{formatDate(m.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button
                          type="button"
                          title="View"
                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        {/* Edit */}
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => setEditingManufacturer(m)}
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => setDeletingManufacturer(m)}
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
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
            <span>Showing {filtered.length} manufacturer{filtered.length === 1 ? "" : "s"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}