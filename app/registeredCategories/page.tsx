"use client"
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef, ChangeEvent, FocusEvent } from "react";
 
// ─── TYPES ────────────────────────────────────────────────────────────────────
 
type CategoryRow = {
  id: string;
  categoryName: string;
  categoryCode: string;
  subCategory: string;
  industryName: string;
  industryId?: string;
};
 
type GroupedCategory = {
  id: string;
  categoryName: string;
  categoryCode: string;
  industryName: string;
  industryId?: string;
  subCategories: string[];
};
 
interface EditFormValues {
  industryId: string;
  name: string;
  code: string;
  image: File | null;
}
 
interface EditFormErrors {
  industryId?: string;
  name?: string;
  code?: string;
  image?: string;
}
 
type EditFieldName = keyof EditFormValues;
 
interface IndustryItem { id: string; name: string; }
 
// ─── CONSTANTS ────────────────────────────────────────────────────────────────
 
const CODE_REGEX = /^[A-Z0-9_-]{3,20}$/;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
 
// ─── VALIDATION ───────────────────────────────────────────────────────────────
 
function validateField(field: EditFieldName, value: string | File | null): string {
  if (field === "image") {
    const file = value as File | null;
    if (!file) return "";
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG or WEBP allowed";
    if (file.size > MAX_IMAGE_SIZE) return "Image must be under 2 MB";
    return "";
  }
  const v = (value as string).trim();
  switch (field) {
    case "industryId": return v ? "" : "Please select an industry";
    case "name":
      if (!v) return "Category name is required";
      if (v.length < 3) return "Minimum 3 characters required";
      if (v.length > 60) return "Maximum 60 characters allowed";
      if (!/^[A-Za-z0-9&.\-\s]+$/.test(v)) return "Invalid category name";
      return "";
    case "code":
      if (!v) return "Category code is required";
      if (v.length < 3) return "Code must be at least 3 characters";
      if (v.length > 20) return "Code cannot exceed 20 characters";
      if (!CODE_REGEX.test(v.toUpperCase())) return "Only A-Z, 0-9, _ and - allowed";
      return "";
    default: return "";
  }
}
 
function validateAll(values: EditFormValues): EditFormErrors {
  return {
    industryId: validateField("industryId", values.industryId),
    name:       validateField("name",       values.name),
    code:       validateField("code",       values.code),
    image:      values.image ? validateField("image", values.image) : "",
  };
}
 
function hasErrors(e: EditFormErrors) { return Object.values(e).some(Boolean); }
 
// ─── HELPERS ──────────────────────────────────────────────────────────────────
 
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
 
// ─── SMALL ICONS ─────────────────────────────────────────────────────────────
 
const BriefcaseIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const TagIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const HashIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="6" y2="21"/><line x1="14" y1="3" x2="10" y2="21"/>
  </svg>
);
const UploadIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const CheckIcon = ({ show }: { show: boolean }) => show ? (
  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
  </span>
) : null;
 
// ─── FIELD COMPONENTS ─────────────────────────────────────────────────────────
 
function FieldLabel({ required, optional, children }: {
  required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400">
      {children}
      {required && <span className="text-emerald-500 text-sm leading-none">*</span>}
      {optional && (
        <span className="text-[9px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 uppercase tracking-wider normal-case font-semibold">
          Optional
        </span>
      )}
    </label>
  );
}
 
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
      <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none">!</span>
      {message}
    </p>
  );
}
 
function inputCls(state: "error" | "ok" | "") {
  const base = "w-full bg-white border rounded-md text-xs text-slate-800 placeholder-slate-300 outline-none transition-all duration-200 pl-9 pr-3 py-2 focus:ring-2";
  if (state === "error") return `${base} border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400`;
  if (state === "ok")    return `${base} border-emerald-400 focus:ring-emerald-400/30 focus:border-emerald-400`;
  return `${base} border-slate-200 hover:border-slate-300 focus:ring-emerald-400/30 focus:border-emerald-400`;
}
 
const caretBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;
 
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="h-px flex-1 bg-slate-100"/>
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">{label}</span>
      <div className="h-px flex-1 bg-slate-100"/>
    </div>
  );
}
 
// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
 
function DeleteCategoryModal({ category, onCancel, onConfirmed }: {
  category: GroupedCategory; onCancel: () => void; onConfirmed: () => void;
}) {
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when modal opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  const isMatch = confirmName.trim() === category.categoryName.trim();

  function handleConfirmChange(e: ChangeEvent<HTMLInputElement>) {
    setConfirmName(e.target.value);
    setNameError("");
    setErrorMsg("");
  }

  async function handleDelete() {
    if (!confirmName.trim()) {
      setNameError("Please type the category name to confirm.");
      return;
    }
    if (!isMatch) {
      setNameError(`"${confirmName}" does not match the category name. Please type it exactly.`);
      return;
    }

    setDeleting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      let data: any = {};
      try { data = await res.json(); } catch { /* non-JSON ok */ }
 
      if (res.ok && data.status !== false) {
        onConfirmed();
      } else {
        setErrorMsg(
          data?.message ||
          `Delete failed (HTTP ${res.status}). Ensure DELETE /api/categories/[id] exists and handles cascade deletion of sub-categories.`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.16s ease-out" }}>
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
            <h2 className="text-sm font-bold text-slate-800">Delete Category</h2>
            <p className="text-[10px] text-slate-500">{category.categoryName} · {category.categoryCode}</p>
          </div>
        </div>
 
        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-slate-800">{category.categoryName}</span>{" "}
            and cascade-delete all associated{" "}
            <span className="font-medium text-red-600">
              sub-categories ({category.subCategories.length} found)
            </span>.
          </p>

          {category.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {category.subCategories.slice(0, 6).map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{s}</span>
              ))}
              {category.subCategories.length > 6 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">+{category.subCategories.length - 6} more</span>
              )}
            </div>
          )}

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
            <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1.5">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <path d="M12 9v4M12 17h.01"/>
              </svg>
              This action cannot be undone.
            </p>
          </div>

          {/* Category name confirmation input */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To confirm, type{" "}
              <span className="font-bold text-slate-800 bg-slate-100 rounded px-1.5 py-0.5 font-mono select-all">
                {category.categoryName}
              </span>{" "}
              below:
            </p>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={confirmName}
                onChange={handleConfirmChange}
                onKeyDown={(e) => { if (e.key === "Enter" && isMatch) handleDelete(); }}
                placeholder={`Type "${category.categoryName}" to confirm`}
                autoComplete="off"
                spellCheck={false}
                className={`w-full rounded-lg border text-xs px-3 py-2.5 outline-none transition-all duration-200 font-mono
                  ${nameError
                    ? "border-red-300 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    : isMatch && confirmName
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 focus:ring-2 focus:ring-red-200 focus:border-red-300"
                  }`}
              />
              {/* Match / mismatch indicator */}
              {confirmName && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isMatch ? (
                    <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </span>
              )}
            </div>
            {nameError && (
              <p className="flex items-start gap-1.5 text-[10px] text-red-500 font-medium leading-relaxed">
                <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none mt-px">!</span>
                {nameError}
              </p>
            )}
            {isMatch && confirmName && !nameError && (
              <p className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Name matches — you may now confirm deletion.
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
          <button type="button" onClick={onCancel} disabled={deleting}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 px-3 py-1.5">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting || !isMatch}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200
              ${deleting
                ? "bg-red-300 text-white cursor-not-allowed"
                : !isMatch
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm shadow-red-200"
              }`}>
            {deleting ? (
              <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>Deleting…</>
            ) : (
              <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>Yes, Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── EDIT CATEGORY MODAL ──────────────────────────────────────────────────────
 
function EditCategoryModal({ category, onClose, onSaved }: {
  category: GroupedCategory; onClose: () => void; onSaved: () => void;
}) {
  const [values, setValues] = useState<EditFormValues>({
    industryId: category.industryId ?? "",
    name:       category.categoryName,
    code:       category.categoryCode,
    image:      null,
  });
  const [errors, setErrors]         = useState<EditFormErrors>({});
  const [touched, setTouched]       = useState<Partial<Record<EditFieldName, boolean>>>({});
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [apiError, setApiError]     = useState("");
  const [loading, setLoading]       = useState(true);
  const [industryList, setIndustryList] = useState<IndustryItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [dragOver, setDragOver]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  // ── Load industry dropdown + category detail ─────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const indRes = await fetch("/api/industryList");
        const indData = await indRes.json();
        setIndustryList(indData.data ?? []);
 
        try {
          const catRes = await fetch(`/api/categories/${category.id}`);
          if (catRes.ok) {
            let cd: any = {};
            try { cd = await catRes.json(); } catch { /* skip */ }
            const c = cd?.data;
            if (c) {
              setValues({
                industryId: c.industryId  ?? category.industryId ?? "",
                name:       c.name        ?? category.categoryName,
                code:       c.code        ?? category.categoryCode,
                image:      null,
              });
            }
          }
        } catch {
          // network error on detail fetch — row data is fine
        }
      } catch (err) {
        console.error("Failed to load category edit data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category.id]);
 
  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  // ── Field state helper ────────────────────────────────────────────────────
  const fieldState = (field: EditFieldName): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (errors[field]) return "error";
    if (field === "image") return values.image ? "ok" : "";
    return (values[field as Exclude<EditFieldName,"image">] as string).trim() ? "ok" : "";
  };
 
  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (field: Exclude<EditFieldName, "image">) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let val = e.target.value;
      if (field === "code") val = val.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20);
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
      setSaved(false);
      setApiError("");
    };
 
  const handleBlur = (field: Exclude<EditFieldName, "image">) =>
    (_: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field] as string) }));
    };
 
  const handleImageFile = (file: File | null) => {
    setTouched((prev) => ({ ...prev, image: true }));
    const err = validateField("image", file);
    setErrors((prev) => ({ ...prev, image: err }));
    if (err || !file) {
      setValues((prev) => ({ ...prev, image: null }));
      setImagePreview("");
      return;
    }
    setValues((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview((e.target?.result as string) || "");
    reader.readAsDataURL(file);
  };
 
  const removeImage = () => {
    setValues((prev) => ({ ...prev, image: null }));
    setImagePreview("");
    setErrors((prev) => ({ ...prev, image: "" }));
    setTouched((prev) => ({ ...prev, image: false }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
 
  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    const allTouched = { industryId: true, name: true, code: true, image: true };
    setTouched(allTouched);
    const errs = validateAll(values);
    setErrors(errs);
    if (hasErrors(errs)) return;
 
    setSaving(true);
    setApiError("");
 
    try {
      const payload = {
        industryId: values.industryId,
        name:       values.name.trim(),
        code:       values.code.trim().toUpperCase(),
      };
 
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
 
      if (!res.ok) {
        let errMsg = `HTTP ${res.status} — ensure PUT /api/categories/[id] route exists on your backend.`;
        try {
          const errData = await res.json();
          errMsg = errData?.message ?? errMsg;
        } catch {
          // body was HTML, not JSON
        }
        setApiError(errMsg);
        return;
      }
 
      let data: any = {};
      try { data = await res.json(); } catch {
        // 204 No Content = valid success
      }
 
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
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.18s ease-out" }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
 
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Category</h2>
              <p className="text-[10px] text-slate-400 font-medium">{category.categoryCode} · {category.industryName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
 
        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-6 h-6 text-emerald-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-xs text-slate-400">Loading category data…</span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 flex flex-col gap-4">
              <SectionDivider label="Category Details" />
 
              {/* Industry */}
              <div className="flex flex-col gap-1">
                <FieldLabel required>Industry</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><BriefcaseIcon /></span>
                  <select value={values.industryId}
                    onChange={handleChange("industryId")}
                    onBlur={handleBlur("industryId")}
                    className={`${inputCls(fieldState("industryId"))} appearance-none cursor-pointer pr-8`}
                    style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                    <option value="">Select industry…</option>
                    {industryList.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  <CheckIcon show={fieldState("industryId") === "ok"} />
                </div>
                <FieldError message={touched.industryId ? errors.industryId : undefined} />
              </div>
 
              {/* Category Name */}
              <div className="flex flex-col gap-1">
                <FieldLabel required>Category Name</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><TagIcon /></span>
                  <input type="text" value={values.name}
                    onChange={handleChange("name")} onBlur={handleBlur("name")}
                    placeholder="Enter category name"
                    maxLength={60}
                    className={inputCls(fieldState("name"))} />
                  <CheckIcon show={fieldState("name") === "ok"} />
                </div>
                <FieldError message={touched.name ? errors.name : undefined} />
              </div>
 
              {/* Category Code */}
              <div className="flex flex-col gap-1">
                <FieldLabel required>Category Code</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><HashIcon /></span>
                  <input type="text" value={values.code}
                    onChange={handleChange("code")} onBlur={handleBlur("code")}
                    placeholder="ELEC_01"
                    maxLength={20}
                    className={`${inputCls(fieldState("code"))} font-mono tracking-widest uppercase`} />
                  <CheckIcon show={fieldState("code") === "ok"} />
                </div>
                {!errors.code && values.code.length < 3 && (
                  <p className="text-[10px] text-slate-400 font-mono">3–20 chars · A-Z, 0-9, _ and -</p>
                )}
                <FieldError message={touched.code ? errors.code : undefined} />
              </div>
 
              {/* Image Upload */}
              <div className="flex flex-col gap-1">
                <FieldLabel optional>Category Image</FieldLabel>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                  className="hidden" />
 
                {!imagePreview ? (
                  <div
                    className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer transition-all duration-200 text-center
                      ${fieldState("image") === "error"
                        ? "border-red-300 bg-red-50"
                        : dragOver
                          ? "border-emerald-400 bg-emerald-50/40"
                          : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/20"
                      }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files?.[0] ?? null); }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm transition-all
                      ${dragOver ? "bg-emerald-100 border-emerald-200 text-emerald-500" : "bg-white border-slate-200 text-slate-400"}`}>
                      <UploadIcon />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">
                      {dragOver ? "Drop to upload" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-[10px] text-slate-400">JPG · PNG · WEBP · Max 2 MB</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white border border-emerald-400 rounded-xl p-2.5 ring-2 ring-emerald-400/10">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-700 truncate">{values.image?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {values.image ? `${(values.image.size / 1024).toFixed(1)} KB` : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700">Replace</button>
                        <button type="button" onClick={removeImage}
                          className="flex items-center gap-1 text-[10px] font-medium text-red-500 hover:text-red-600">
                          <TrashIcon /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <FieldError message={touched.image ? errors.image : undefined} />
              </div>
 
              {/* API error strip */}
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
 
        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <button type="button" onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
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
            <button type="button" onClick={handleSave} disabled={saving || loading}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm
                ${saving || loading
                  ? "bg-emerald-300 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-emerald-200"
                }`}>
              {saving ? (
                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>Saving…</>
              ) : (
                <><svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M13 4.5L6.5 11 3 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
 
export default function CategoryListPage() {
  const [rows, setRows]                         = useState<CategoryRow[]>([]);
  const [search, setSearch]                     = useState("");
  const [industryFilter, setIndustryFilter]     = useState<string>("ALL");
  const [editingCategory, setEditingCategory]   = useState<GroupedCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<GroupedCategory | null>(null);
  const router = useRouter();
 
  async function loadCategories() {
    try {
      const res = await fetch("/api/registeredCategories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error(error);
      setRows([]);
    }
  }
 
  useEffect(() => { loadCategories(); }, []);
 
  const grouped = useMemo<GroupedCategory[]>(() => {
    const map = new Map<string, GroupedCategory>();
    for (const r of rows) {
      const key = `${r.categoryCode}|${r.categoryName}`;
      const existing = map.get(key);
      if (existing) {
        if (r.subCategory && !existing.subCategories.includes(r.subCategory))
          existing.subCategories.push(r.subCategory);
      } else {
        map.set(key, {
          id:           r.id,
          categoryName: r.categoryName,
          categoryCode: r.categoryCode,
          industryName: r.industryName,
          industryId:   r.industryId,
          subCategories: r.subCategory ? [r.subCategory] : [],
        });
      }
    }
    return Array.from(map.values());
  }, [rows]);
 
  const industries = useMemo(
    () => Array.from(new Set(grouped.map((g) => g.industryName))).sort(),
    [grouped]
  );
 
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grouped.filter((g) => {
      if (industryFilter !== "ALL" && g.industryName !== industryFilter) return false;
      if (!q) return true;
      return (
        g.categoryName.toLowerCase().includes(q) ||
        g.categoryCode.toLowerCase().includes(q) ||
        g.industryName.toLowerCase().includes(q) ||
        g.subCategories.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [grouped, search, industryFilter]);
 
  const totalSubCategories = useMemo(() => rows.length, [rows]);
 
  const handleEditSaved       = useCallback(() => { loadCategories(); }, []);
  const handleDeleteConfirmed = useCallback(() => { setDeletingCategory(null); loadCategories(); }, []);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
 
      {/* Edit Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={handleEditSaved}
        />
      )}
 
      {/* Delete Confirm Modal */}
      {deletingCategory && (
        <DeleteCategoryModal
          category={deletingCategory}
          onCancel={() => setDeletingCategory(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}
 
      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Categories
            </h1>
            <p className="text-xs text-slate-500">All registered categories with their sub-categories and industry mapping</p>
          </div>
          <button onClick={() => router.push("/categories")}
            className="rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-green-500/30 transition hover:shadow-lg">
            + Add Category
          </button>
        </div>
 
        {/* Stats */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Categories</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{grouped.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sub Categories</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalSubCategories}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Industries</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{industries.length}</p>
          </div>
        </div>
 
        {/* Filters */}
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, code, sub-category or industry…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100" />
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="ALL">All Industries</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
 
        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Category", "Code", "Sub Categories", "Industry", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-400">No categories found.</td></tr>
                ) : (
                  filtered.map((g) => (
                    <tr key={`${g.categoryCode}-${g.categoryName}`} className="transition hover:bg-emerald-50/40">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow-sm">
                            {initials(g.categoryName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900">{g.categoryName}</p>
                            <p className="truncate text-[10px] text-slate-400">{g.subCategories.length} sub categor{g.subCategories.length === 1 ? "y" : "ies"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">{g.categoryCode}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {g.subCategories.map((s) => (
                            <span key={s} className="inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{g.industryName}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button type="button" title="View"
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          {/* Edit */}
                          <button type="button" title="Edit"
                            onClick={() => setEditingCategory(g)}
                            className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                          </button>
                          {/* Delete */}
                          <button type="button" title="Delete"
                            onClick={() => setDeletingCategory(g)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <span>Showing {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}