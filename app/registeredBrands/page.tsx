"use client"
import { useEffect, useMemo, useState, useCallback, useRef, ChangeEvent, FocusEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Brand = {
  id: string;
  logo: string;
  brandName: string;
  parentBrandName?: string;
  brandCode: string;
  brandType: string;
  companyName: string;
  productCount: number;
  status: boolean;
  createdAt: string;
};

interface EditFormValues {
  name: string;
  brandCode: string;
  brandType: string;
  manufacturerId: string;
  parentBrand: string;
  country: string;
  description: string;
}

interface EditFormErrors {
  name?: string;
  brandCode?: string;
  brandType?: string;
  manufacturerId?: string;
  description?: string;
  logo?: string;
}

type FieldName = keyof EditFormValues;

interface ManufacturerItem { id: string; company_name: string; }
interface ParentBrandItem  { id: string; name: string; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_SIZE_MB = 2;

const COUNTRIES = [
  { value: "AF", label: "Afghanistan" }, { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" }, { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" }, { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" }, { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" }, { value: "AZ", label: "Azerbaijan" },
  { value: "BH", label: "Bahrain" }, { value: "BD", label: "Bangladesh" },
  { value: "BY", label: "Belarus" }, { value: "BE", label: "Belgium" },
  { value: "BR", label: "Brazil" }, { value: "BN", label: "Brunei" },
  { value: "BG", label: "Bulgaria" }, { value: "CA", label: "Canada" },
  { value: "CL", label: "Chile" }, { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" }, { value: "CR", label: "Costa Rica" },
  { value: "HR", label: "Croatia" }, { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" }, { value: "DK", label: "Denmark" },
  { value: "DO", label: "Dominican Republic" }, { value: "EG", label: "Egypt" },
  { value: "EE", label: "Estonia" }, { value: "ET", label: "Ethiopia" },
  { value: "FI", label: "Finland" }, { value: "FR", label: "France" },
  { value: "GE", label: "Georgia" }, { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" }, { value: "GR", label: "Greece" },
  { value: "HK", label: "Hong Kong" }, { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" }, { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" }, { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" }, { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" }, { value: "IT", label: "Italy" },
  { value: "JP", label: "Japan" }, { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" }, { value: "KE", label: "Kenya" },
  { value: "KW", label: "Kuwait" }, { value: "LB", label: "Lebanon" },
  { value: "MY", label: "Malaysia" }, { value: "MV", label: "Maldives" },
  { value: "MX", label: "Mexico" }, { value: "MA", label: "Morocco" },
  { value: "NP", label: "Nepal" }, { value: "NL", label: "Netherlands" },
  { value: "NZ", label: "New Zealand" }, { value: "NG", label: "Nigeria" },
  { value: "NO", label: "Norway" }, { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" }, { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" }, { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" }, { value: "QA", label: "Qatar" },
  { value: "RO", label: "Romania" }, { value: "RU", label: "Russia" },
  { value: "SA", label: "Saudi Arabia" }, { value: "SG", label: "Singapore" },
  { value: "ZA", label: "South Africa" }, { value: "KR", label: "South Korea" },
  { value: "ES", label: "Spain" }, { value: "LK", label: "Sri Lanka" },
  { value: "SE", label: "Sweden" }, { value: "CH", label: "Switzerland" },
  { value: "TW", label: "Taiwan" }, { value: "TH", label: "Thailand" },
  { value: "TR", label: "Turkey" }, { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" }, { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" }, { value: "UZ", label: "Uzbekistan" },
  { value: "VN", label: "Vietnam" }, { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" }, { value: "ZW", label: "Zimbabwe" },
];

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function validateField(field: FieldName | "logo", value: string, logoFile?: File | null): string {
  const v = value.trim();
  switch (field) {
    case "name":
      if (!v) return "Brand name is required.";
      if (v.length < 2) return "Must be at least 2 characters.";
      if (v.length > 100) return "Must be 100 characters or fewer.";
      if (!/^[a-zA-Z0-9\s\-&.'()+]+$/.test(v)) return "Only letters, numbers, and common symbols allowed.";
      return "";
    case "brandCode":
      if (v && !/^[A-Z0-9\s\-&.'()+]+$/.test(v)) return "Only uppercase letters and numbers are allowed.";
      return "";
    case "brandType":
      return v ? "" : "Brand type is required.";
    case "manufacturerId":
      return v ? "" : "Manufacturer is required.";
    case "description":
      if (!v) return "";
      if (v.length > 500) return "Must be 500 characters or fewer.";
      return "";
    case "logo":
      if (!logoFile) return "";
      if (logoFile.size > MAX_LOGO_SIZE_MB * 1024 * 1024)
        return `File exceeds ${MAX_LOGO_SIZE_MB} MB limit.`;
      if (!ALLOWED_LOGO_TYPES.includes(logoFile.type))
        return "Only PNG, JPG, SVG or WEBP files are allowed.";
      return "";
    default: return "";
  }
}

function validateAll(values: EditFormValues, logoFile: File | null): EditFormErrors {
  return {
    name:           validateField("name",           values.name),
    brandCode:      validateField("brandCode",      values.brandCode),
    brandType:      validateField("brandType",      values.brandType),
    manufacturerId: validateField("manufacturerId", values.manufacturerId),
    description:    validateField("description",    values.description),
    logo:           validateField("logo",           "", logoFile),
  };
}

function hasErrors(e: EditFormErrors) { return Object.values(e).some(Boolean); }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatBrandType(type: string) {
  return type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── SMALL UI ATOMS ───────────────────────────────────────────────────────────

function FieldLabel({ required, optional, children }: {
  required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400">
      {children}
      {required && <span className="text-emerald-500 text-sm leading-none">*</span>}
      {optional && (
        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 uppercase tracking-wider normal-case">
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

function CheckMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </span>
  );
}

function inputCls(state: "error" | "ok" | "") {
  const base = "w-full bg-white border rounded-md text-xs text-slate-800 placeholder-slate-300 outline-none transition-all duration-200 pl-9 pr-3 py-2 focus:ring-2";
  if (state === "error") return `${base} border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400`;
  if (state === "ok")    return `${base} border-emerald-400 focus:ring-emerald-400/30 focus:border-emerald-400`;
  return `${base} border-slate-200 hover:border-slate-300 focus:ring-emerald-400/30 focus:border-emerald-400`;
}

function selectCls(state: "error" | "ok" | "") {
  return inputCls(state) + " appearance-none cursor-pointer pr-8";
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="h-px flex-1 bg-slate-100"/>
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">{label}</span>
      <div className="h-px flex-1 bg-slate-100"/>
    </div>
  );
}

// Inline SVG icons
const TagIcon    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const GridIcon   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const BldgIcon   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V7l6-4v18M9 11h6M9 15h6"/></svg>;
const UpArrowIcon= () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7-7 7 7"/></svg>;
const GlobeIcon  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const DocIcon    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const UploadIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteBrandModal({ brand, onCancel, onConfirmed }: {
  brand: Brand; onCancel: () => void; onConfirmed: () => void;
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

  const isMatch = confirmName.trim() === brand.brandName.trim();

  function handleConfirmChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setConfirmName(val);
    setNameError("");
    setErrorMsg("");
  }

  async function handleDelete() {
    if (!confirmName.trim()) {
      setNameError("Please type the brand name to confirm.");
      return;
    }
    if (!isMatch) {
      setNameError(`"${confirmName}" does not match the brand name. Please type it exactly.`);
      return;
    }

    setDeleting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/brands/${brand.id}`, { method: "DELETE" });
      let data: any = {};
      try { data = await res.json(); } catch { /* non-JSON ok */ }

      if (res.ok && data.status !== false) {
        onConfirmed();
      } else {
        setErrorMsg(
          data?.message ||
          `Delete failed (HTTP ${res.status}). Ensure DELETE /api/brands/[id] exists and handles cascade deletion.`
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
            <h2 className="text-sm font-bold text-slate-800">Delete Brand</h2>
            <p className="text-[10px] text-slate-500">{brand.brandName} · {brand.brandCode}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-slate-800">{brand.brandName}</span>{" "}
            and cascade-delete all associated{" "}
            <span className="font-medium text-red-600">products, product variants, SKUs, and SKU attribute values</span>.
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

          {/* Brand name confirmation input */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To confirm, type{" "}
              <span className="font-bold text-slate-800 bg-slate-100 rounded px-1.5 py-0.5 font-mono select-all">
                {brand.brandName}
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
                placeholder={`Type "${brand.brandName}" to confirm`}
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
                <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none`}>
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
              <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Deleting…</>
            ) : (
              <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>Yes, Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT BRAND MODAL ─────────────────────────────────────────────────────────

function EditBrandModal({ brand, onClose, onSaved }: {
  brand: Brand; onClose: () => void; onSaved: () => void;
}) {
  const [values, setValues] = useState<EditFormValues>({
    name: brand.brandName,
    brandCode: brand.brandCode,
    brandType: brand.brandType,
    manufacturerId: "",
    parentBrand: "",
    country: "IN",
    description: "",
  });
  const [errors, setErrors]   = useState<EditFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName | "logo", boolean>>>({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manufacturerList, setManufacturerList] = useState<ManufacturerItem[]>([]);
  const [parentBrandList,  setParentBrandList]  = useState<ParentBrandItem[]>([]);

  // ── Load dropdowns + brand detail ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [mfRes, pbRes] = await Promise.all([
          fetch("/api/manufacturerList"),
          fetch("/api/parentBrandList"),
        ]);
        const mfData = await mfRes.json();
        const pbData = await pbRes.json();
        setManufacturerList(mfData.data ?? []);
        setParentBrandList(pbData.data ?? []);

        try {
          const brandRes = await fetch(`/api/brands/${brand.id}`);
          if (brandRes.ok) {
            let bd: any = {};
            try { bd = await brandRes.json(); } catch { /* skip */ }
            const b = bd?.data;
            if (b) {
              setValues({
                name:           b.name           ?? brand.brandName,
                brandCode:      b.brandCode       ?? brand.brandCode,
                brandType:      b.brandType       ?? brand.brandType,
                manufacturerId: b.manufacturerId  ?? "",
                parentBrand:    b.parentBrand     ?? "",
                country:        b.country         ?? "IN",
                description:    b.description     ?? "",
              });
            }
          }
        } catch {
          // network error on detail fetch — still fine, row data is pre-filled
        }
      } catch (err) {
        console.error("Failed to load brand edit data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brand.id]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const fieldState = (field: FieldName | "logo"): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (field === "logo") {
      if (validateField("logo", "", logoFile)) return "error";
      return logoFile ? "ok" : "";
    }
    if (errors[field as keyof EditFormErrors]) return "error";
    const val = values[field as FieldName] ?? "";
    if (val && val !== "none" && val !== "") return "ok";
    return "";
  };

  const handleChange = (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
      setSaved(false);
      setApiError("");
    };

  const handleBlur = (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
    };

  // ── Logo handlers ──────────────────────────────────────────────────────────

  const processLogoFile = (file: File) => {
    setTouched((prev) => ({ ...prev, logo: true }));
    const err = validateField("logo", "", file);
    if (err) { setErrors((prev) => ({ ...prev, logo: err })); return; }
    setLogoFile(file);
    setErrors((prev) => ({ ...prev, logo: "" }));
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setErrors((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    const allTouched = Object.fromEntries(
      (Object.keys(values) as FieldName[]).map((k) => [k, true])
    ) as Record<FieldName, boolean>;
    setTouched({ ...allTouched, logo: true });
    const errs = validateAll(values, logoFile);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setSaving(true);
    setApiError("");

    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let errMsg = `HTTP ${res.status} — ensure PUT /api/brands/[id] route exists on your backend.`;
        try {
          const errData = await res.json();
          errMsg = errData?.message ?? errMsg;
        } catch {
          // body wasn't JSON
        }
        setApiError(errMsg);
        return;
      }

      let data: any = {};
      try { data = await res.json(); } catch {
        // 204 No Content is valid success
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
          ? "Network error — could not reach the server."
          : `Unexpected error: ${err?.message ?? "unknown"}`
      );
    } finally {
      setSaving(false);
    }
  }

  const descLen = values.description.length;

  const caretBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
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
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Brand</h2>
              <p className="text-[10px] text-slate-400 font-medium">{brand.brandCode} · {brand.companyName}</p>
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
                <span className="text-xs text-slate-400">Loading brand data…</span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 flex flex-col gap-4">
              <SectionDivider label="Brand Information" />

              {/* Brand Name */}
              <div className="flex flex-col gap-1">
                <FieldLabel required>Brand Name</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><TagIcon /></span>
                  <input type="text" value={values.name}
                    onChange={handleChange("name")} onBlur={handleBlur("name")}
                    placeholder="e.g. Dove, Lakmé, Head & Shoulders"
                    maxLength={100}
                    className={inputCls(fieldState("name"))} />
                  <CheckMark show={fieldState("name") === "ok"} />
                </div>
                <FieldError message={touched.name ? errors.name : undefined} />
              </div>

              {/* Brand Code */}
              <div className="flex flex-col gap-1">
                <FieldLabel>Brand Code</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><TagIcon /></span>
                  <input type="text" value={values.brandCode}
                    onChange={handleChange("brandCode")} onBlur={handleBlur("brandCode")}
                    placeholder="e.g. CP-HUL"
                    maxLength={100}
                    className={inputCls(fieldState("brandCode"))} />
                  <CheckMark show={fieldState("brandCode") === "ok"} />
                </div>
                <FieldError message={touched.brandCode ? errors.brandCode : undefined} />
              </div>

              {/* Brand Type + Manufacturer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel required>Brand Type</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><GridIcon /></span>
                    <input type="text" value={values.brandType}
                      onChange={handleChange("brandType")} onBlur={handleBlur("brandType")}
                      placeholder="e.g. Hair Care, Electronics"
                      maxLength={100}
                      className={inputCls(fieldState("brandType"))} />
                    <CheckMark show={fieldState("brandType") === "ok"} />
                  </div>
                  <FieldError message={touched.brandType ? errors.brandType : undefined} />
                </div>

                <div className="flex flex-col gap-1">
                  <FieldLabel required>Manufacturer</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><BldgIcon /></span>
                    <select value={values.manufacturerId}
                      onChange={handleChange("manufacturerId")} onBlur={handleBlur("manufacturerId")}
                      className={selectCls(fieldState("manufacturerId"))}
                      style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                      <option value="">Select manufacturer…</option>
                      {manufacturerList.map((m) => (
                        <option key={m.id} value={m.id}>{m.company_name}</option>
                      ))}
                    </select>
                    <CheckMark show={fieldState("manufacturerId") === "ok"} />
                  </div>
                  <FieldError message={touched.manufacturerId ? errors.manufacturerId : undefined} />
                </div>
              </div>

              {/* Parent Brand + Country */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel optional>Parent Brand</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><UpArrowIcon /></span>
                    <select value={values.parentBrand}
                      onChange={handleChange("parentBrand")} onBlur={handleBlur("parentBrand")}
                      className={selectCls(fieldState("parentBrand"))}
                      style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                      <option value="">None</option>
                      {parentBrandList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <FieldLabel optional>Country of Origin</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><GlobeIcon /></span>
                    <select value={values.country}
                      onChange={handleChange("country")} onBlur={handleBlur("country")}
                      className={selectCls("")}
                      style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <SectionDivider label="Details & Assets" />

              {/* Description */}
              <div className="flex flex-col gap-1">
                <FieldLabel optional>Description</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-300 pointer-events-none"><DocIcon /></span>
                  <textarea value={values.description}
                    onChange={handleChange("description")} onBlur={handleBlur("description")}
                    placeholder="Brief description of the brand, its positioning, values or target audience…"
                    rows={3} maxLength={520}
                    className={`${inputCls(fieldState("description")).replace("py-2", "pt-2 pb-6")} resize-none leading-relaxed`} />
                  <span className={`absolute right-2.5 bottom-2 text-[9px] font-mono pointer-events-none ${descLen > 500 ? "text-red-500" : "text-slate-300"}`}>
                    {descLen} / 500
                  </span>
                </div>
                <FieldError message={touched.description ? errors.description : undefined} />
              </div>

              {/* Logo Upload */}
              <div className="flex flex-col gap-1">
                <FieldLabel optional>Brand Logo</FieldLabel>
                {!logoFile ? (
                  <div
                    className={`relative border-[1.5px] border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 text-center
                      ${isDragging ? "border-emerald-400 bg-emerald-50" : errors.logo ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processLogoFile(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept={ALLOWED_LOGO_TYPES.join(",")}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) processLogoFile(f); }}
                      className="hidden" />
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm transition-all duration-200
                      ${isDragging ? "bg-emerald-100 border-emerald-200 text-emerald-500" : "bg-white border-slate-200 text-slate-400"}`}>
                      <UploadIcon />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">
                      {isDragging ? "Drop to upload" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, SVG, WEBP · Max 2 MB</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white border border-emerald-400 rounded-xl p-2.5 ring-2 ring-emerald-400/10">
                    {logoPreviewUrl ? (
                      <img src={logoPreviewUrl} alt="Logo preview"
                        className="w-9 h-9 rounded-lg object-contain border border-slate-100 bg-white flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600 flex-shrink-0">
                        {logoFile.name.replace(/\.[^.]+$/, "").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-700 truncate">{logoFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {logoFile.size > 1024 * 1024
                          ? (logoFile.size / 1024 / 1024).toFixed(1) + " MB"
                          : Math.round(logoFile.size / 1024) + " KB"}
                      </p>
                    </div>
                    <button onClick={removeLogo} type="button"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                )}
                <FieldError message={touched.logo ? errors.logo : undefined} />
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
                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Saving…</>
              ) : (
                <><svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M13 4.5L6.5 11 3 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const [brands, setBrands]                   = useState<Brand[]>([]);
  const [query, setQuery]                     = useState("");
  const [companyFilter, setCompanyFilter]     = useState<string>("all");
  const [typeFilter, setTypeFilter]           = useState<string>("all");
  const [editingBrand, setEditingBrand]       = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand]     = useState<Brand | null>(null);
  const router = useRouter();

  async function loadBrands() {
    try {
      const res = await fetch("/api/registeredBrands");
      const data = await res.json();
      setBrands(data.data ?? []);
    } catch (error: unknown) {
      if (error instanceof Error) console.log(error.message);
      setBrands([]);
    }
  }

  useEffect(() => { loadBrands(); }, []);

  const companies = useMemo(() => Array.from(new Set(brands.map((b) => b.companyName))).sort(), [brands]);
  const types     = useMemo(() => Array.from(new Set(brands.map((b) => b.brandType))).sort(), [brands]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands.filter((b) => {
      const matchQ = !q || b.brandName.toLowerCase().includes(q) || b.brandCode.toLowerCase().includes(q);
      const matchC = companyFilter === "all" || b.companyName === companyFilter;
      const matchT = typeFilter   === "all" || b.brandType   === typeFilter;
      return matchQ && matchC && matchT;
    });
  }, [brands, query, companyFilter, typeFilter]);

  const totalProducts  = useMemo(() => brands.reduce((a, b) => a + (Number(b.productCount) || 0), 0), [brands]);
  const totalCompanies = useMemo(() => new Set(brands.map((b) => b.companyName)).size, [brands]);

  const handleEditSaved       = useCallback(() => { loadBrands(); }, []);
  const handleDeleteConfirmed = useCallback(() => { setDeletingBrand(null); loadBrands(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">

      {/* Edit Modal */}
      {editingBrand && (
        <EditBrandModal
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingBrand && (
        <DeleteBrandModal
          brand={deletingBrand}
          onCancel={() => setDeletingBrand(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}

      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">Brands</h1>
            <p className="text-xs text-slate-500">Manage and view all registered brands</p>
          </div>
          <div className="rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-green-500/30 transition hover:shadow-lg">
            <button className="cursor-pointer" onClick={() => router.push("/brands")}>+ Add Brand</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brands</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{brands.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Products</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalProducts}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Companies</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{totalCompanies}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name or code…"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100" />
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="all">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-100">
            <option value="all">All Types</option>
            {types.map((t) => <option key={t} value={t}>{formatBrandType(t)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-slate-50">
                <tr>
                  {["Brand","Parent Brand","Code","Type","Company","Products","Status","Created","Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-xs text-slate-400">No brands found</td></tr>
                )}
                {filtered.map((brand) => (
                  <tr key={brand.id} className="transition hover:bg-emerald-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-[10px] font-bold text-white shadow flex-shrink-0">
                          {initials(brand.brandName)}
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-800">
                            <button className="cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => router.push(`/brands/${brand.id}`)}>
                              {brand.brandName}
                            </button>
                          </h3>
                          <p className="max-w-[120px] truncate text-[10px] text-slate-500">{brand.logo || "No logo"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {brand.parentBrandName ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{brand.parentBrandName}</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Independent</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">{brand.brandCode}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">{formatBrandType(brand.brandType)}</span>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-slate-700">{brand.companyName}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{brand.productCount}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${brand.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {brand.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{formatDate(brand.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button type="button" title="View"
                          onClick={() => router.push(`/brands/${brand.id}`)}
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        {/* Edit */}
                        <button type="button" title="Edit"
                          onClick={() => setEditingBrand(brand)}
                          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button type="button" title="Delete"
                          onClick={() => setDeletingBrand(brand)}
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
            <span>Showing {filtered.length} brand{filtered.length === 1 ? "" : "s"}</span>
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}