"use client"
import { useState, useEffect, useRef, ChangeEvent, FocusEvent, DragEvent } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FormValues {
  name: string;
  brandCode: string;
  brandType: string;
  manufacturerId: string;
  parentBrand: string;
  country: string;
  description: string;
}

interface FormErrors {
  name?: string;
  brandCode?: string;
  brandType?: string;
  manufacturerId?: string;
  description?: string;
  logo?: string;
}

type FieldName = keyof FormValues;

interface brands {
  id: string;
  company_name: string;
}
interface parentBrands {
  id: string;
  name: string;
}

// ─── OPTION LISTS ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "BN", label: "Brunei" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "CG", label: "Congo" },
  { value: "CR", label: "Costa Rica" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "DO", label: "Dominican Republic" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "EE", label: "Estonia" },
  { value: "ET", label: "Ethiopia" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GR", label: "Greece" },
  { value: "GT", label: "Guatemala" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LY", label: "Libya" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MO", label: "Macau" },
  { value: "MG", label: "Madagascar" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MX", label: "Mexico" },
  { value: "MN", label: "Mongolia" },
  { value: "MA", label: "Morocco" },
  { value: "MM", label: "Myanmar" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NZ", label: "New Zealand" },
  { value: "NG", label: "Nigeria" },
  { value: "KP", label: "North Korea" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PA", label: "Panama" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "QA", label: "Qatar" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "ZA", label: "South Africa" },
  { value: "KR", label: "South Korea" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" },
  { value: "TW", label: "Taiwan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
];

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_SIZE_MB = 2;

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const INITIAL_VALUES: FormValues = {
  name: "",
  brandCode: "",
  brandType: "",
  manufacturerId: "",
  parentBrand: "none",
  country: "IN",
  description: "",
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function validateField(field: FieldName | "logo", value: string, logoFile?: File | null): string {
  const v = value.trim();

  switch (field) {
    case "name":
      if (!v) return "Brand name is required.";
      if (v.length < 2) return "Must be at least 2 characters.";
      if (v.length > 100) return "Must be 100 characters or fewer.";
      if (!/^[a-zA-Z0-9\s\-&.'()+]+$/.test(v))
        return "Only letters, numbers, and common symbols allowed.";
      return "";

    case "brandCode":
      if (!/^[A-Z0-9\s\-&.'()+]+$/.test(v))
        return "Only Capital Letters and Numbers are allowed.";
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

    default:
      return "";
  }
}

function validateAll(values: FormValues, logoFile: File | null): FormErrors {
  return {
    name: validateField("name", values.name),
    brandCode: validateField("brandCode", values.brandCode),
    brandType: validateField("brandType", values.brandType),
    manufacturerId: validateField("manufacturerId", values.manufacturerId),
    description: validateField("description", values.description),
    logo: validateField("logo", "", logoFile),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

function calcProgress(values: FormValues, logoFile: File | null): number {
  let score = 0;
  if (values.name.trim() && !validateField("name", values.name)) score += 25;
  if (values.brandCode.trim() && !validateField("brandCode", values.brandCode)) score += 25;
  if (values.brandType) score += 25;
  if (values.manufacturerId) score += 25;
  if (values.description.trim() && !validateField("description", values.description)) score += 5;
  if (logoFile && !validateField("logo", "", logoFile)) score += 5;
  return Math.min(100, score);
}

// ─── DESIGN ATOMS (matching Registered Brands page) ───────────────────────────

// FieldLabel — matches the list page's edit modal atom
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

// FieldError — matches the list page's circle-bang error atom
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
      <span className="flex-shrink-0 w-3 h-3 rounded-full border border-red-400 flex items-center justify-center text-[8px] font-bold leading-none">!</span>
      {message}
    </p>
  );
}

// CheckMark — matches the list page's edit modal green tick
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

// inputCls — matches the Brands list / edit modal exactly
function inputCls(state: "error" | "ok" | ""): string {
  const base = "w-full bg-white border rounded-md text-xs text-slate-800 placeholder-slate-300 outline-none transition-all duration-200 pl-9 pr-3 py-2 focus:ring-2";
  if (state === "error") return `${base} border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400`;
  if (state === "ok")    return `${base} border-emerald-400 focus:ring-emerald-400/30 focus:border-emerald-400`;
  return `${base} border-slate-200 hover:border-slate-300 focus:ring-emerald-400/30 focus:border-emerald-400`;
}

function selectCls(state: "error" | "ok" | ""): string {
  return inputCls(state) + " appearance-none cursor-pointer pr-8";
}

// SectionDivider — matches the Brands edit modal divider
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="h-px flex-1 bg-slate-100"/>
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 px-2">{label}</span>
      <div className="h-px flex-1 bg-slate-100"/>
    </div>
  );
}

// Caret SVG for selects
const caretBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

// Inline SVG icons (same as Brands list)
const TagIcon     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const GridIcon    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const BldgIcon    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V7l6-4v18M9 11h6M9 15h6"/></svg>;
const UpArrowIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7-7 7 7"/></svg>;
const GlobeIcon   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const DocIcon     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const UploadIcon  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border border-emerald-200 rounded-xl px-5 py-4 shadow-xl min-w-[260px] max-w-[300px]"
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

export default function AddBrandPage() {
  const [values, setValues]         = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors]         = useState<FormErrors>({});
  const [touched, setTouched]       = useState<Partial<Record<FieldName | "logo", boolean>>>({});
  const [loading, setLoading]       = useState(false);
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast]           = useState<{ title: string; subtitle: string } | null>(null);
  const [statusMsg, setStatusMsg]   = useState("");
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const [brandList, setBrandList]   = useState<brands[]>([]);
  const [parentBrand, setParentBrand] = useState<parentBrands[]>([]);

  async function blist() {
    let data = await fetch("/api/manufacturerList");
    let finalData = await data.json();
    setBrandList(finalData.data);
  }
  async function plist() {
    let data = await fetch("/api/parentBrandList");
    let finalData = await data.json();
    setParentBrand(finalData.data);
  }

  useEffect(() => {
    blist();
    plist();
  }, []);

  const progress = calcProgress(values, logoFile);

  // ── Field state helper ────────────────────────────────────────────────────

  const fieldState = (field: FieldName | "logo"): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (field === "logo") {
      const err = validateField("logo", "", logoFile);
      if (err) return "error";
      return logoFile ? "ok" : "";
    }
    const val = values[field as FieldName] ?? "";
    if (errors[field as keyof FormErrors]) return "error";
    if (val && val !== "none" && val !== "") return "ok";
    return "";
  };

  // ── Handlers (all original logic preserved) ───────────────────────────────

  const handleChange =
    (field: FieldName) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) {
        setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
      }
    };

  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
    };

  const processLogoFile = (file: File) => {
    setTouched((prev) => ({ ...prev, logo: true }));
    const err = validateField("logo", "", file);
    if (err) { setErrors((prev) => ({ ...prev, logo: err })); return; }
    setLogoFile(file);
    setErrors((prev) => ({ ...prev, logo: "" }));
    const url = URL.createObjectURL(file);
    setLogoPreviewUrl(url);
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setErrors((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showToast = (title: string, subtitle: string) => {
    setToast({ title, subtitle });
    setTimeout(() => setToast(null), 4200);
  };

  const handleSubmit = async () => {
    const allTouched = {
      name: true, brandCode: true, brandType: true, manufacturerId: true,
      parentBrand: true, country: true, description: true, logo: true,
    };
    setTouched(allTouched);
    const newErrors = validateAll(values, logoFile);
    setErrors(newErrors);
    if (hasErrors(newErrors)) {
      setStatusMsg("Please fix the highlighted errors before saving.");
      setTimeout(() => setStatusMsg(""), 3500);
      return;
    }
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1500));
    setLoading(false);
    console.log(values);
    try {
      let res = await fetch("/api/brands", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      await plist();
      let data = await res.json();
      if (data.status == true) {
        showToast("Brand saved!", `"${values.name.trim()}" has been added to your catalog.`);
        handleReset();
        return;
      }
      showToast("Brand not saved!", `${data.message}`);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setStatusMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const descLen  = values.description.length;
  const descOver = descLen > 500;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 font-sans">

      <div className="mx-auto max-w-2xl">

        {/* ── Page header — matches Brands list page ── */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Add Brand
            </h1>
            <p className="text-xs text-slate-500">BOXAIO — Register a new brand and associate it with a manufacturer</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 flex-shrink-0">
            <span className="text-emerald-500 text-sm leading-none">*</span> Required
          </p>
        </div>

        {/* ── Progress bar — same stat-card style as Add Manufacturer ── */}
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

        {/* ── Card ── */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Card header — matches Brands edit modal header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Brand Details</h2>
              <p className="text-[10px] text-slate-400 font-medium">Fill in all required fields to register</p>
            </div>
          </div>

          {/* ── Form body ── */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <SectionDivider label="Brand Information" />

            {/* Brand Name */}
            <div className="flex flex-col gap-1">
              <FieldLabel required>Brand Name</FieldLabel>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><TagIcon /></span>
                <input
                  type="text"
                  placeholder="e.g. Dove, Lakmé, Head & Shoulders"
                  value={values.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  className={inputCls(fieldState("name"))}
                  maxLength={100}
                  autoComplete="off"
                  spellCheck={false}
                />
                <CheckMark show={fieldState("name") === "ok"} />
              </div>
              <FieldError message={touched.name ? errors.name : undefined} />
            </div>

            {/* Brand Code */}
            <div className="flex flex-col gap-1">
              <FieldLabel required>Brand Code</FieldLabel>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><TagIcon /></span>
                <input
                  type="text"
                  placeholder="e.g. CP-HUL"
                  value={values.brandCode}
                  onChange={handleChange("brandCode")}
                  onBlur={handleBlur("brandCode")}
                  className={inputCls(fieldState("brandCode"))}
                  maxLength={100}
                  autoComplete="off"
                  spellCheck={false}
                />
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
                  <input
                    type="text"
                    placeholder="e.g. Hair Care, Electronics"
                    value={values.brandType}
                    onChange={handleChange("brandType")}
                    onBlur={handleBlur("brandType")}
                    className={inputCls(fieldState("brandType"))}
                    maxLength={100}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <CheckMark show={fieldState("brandType") === "ok"} />
                </div>
                <FieldError message={touched.brandType ? errors.brandType : undefined} />
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel required>Manufacturer</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><BldgIcon /></span>
                  <select
                    value={values.manufacturerId}
                    onChange={handleChange("manufacturerId")}
                    onBlur={handleBlur("manufacturerId")}
                    className={selectCls(fieldState("manufacturerId"))}
                    style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                  >
                    <option value="">Select manufacturer…</option>
                    {brandList && brandList.map((e) => (
                      <option key={e.id} value={e.id}>{e.company_name}</option>
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
                  <select
                    value={values.parentBrand}
                    onChange={handleChange("parentBrand")}
                    onBlur={handleBlur("parentBrand")}
                    className={selectCls(fieldState("parentBrand"))}
                    style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                  >
                    <option value="">Select parent brand</option>
                    {parentBrand && parentBrand.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel optional>Country of Origin</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><GlobeIcon /></span>
                  <select
                    value={values.country}
                    onChange={handleChange("country")}
                    onBlur={handleBlur("country")}
                    className={selectCls("")}
                    style={{ backgroundImage: caretBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                  >
                    {COUNTRIES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
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
                <textarea
                  placeholder="Brief description of the brand, its positioning, values or target audience…"
                  value={values.description}
                  onChange={handleChange("description")}
                  onBlur={handleBlur("description")}
                  rows={3}
                  className={`${inputCls(fieldState("description")).replace("py-2", "pt-2 pb-6")} resize-none leading-relaxed`}
                  maxLength={520}
                />
                <span className={`absolute right-2.5 bottom-2 text-[9px] font-mono pointer-events-none ${descOver ? "text-red-500" : "text-slate-300"}`}>
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
                    ${isDragging
                      ? "border-emerald-400 bg-emerald-50"
                      : errors.logo
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload brand logo"
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_LOGO_TYPES.join(",")}
                    onChange={handleLogoChange}
                    className="hidden"
                  />
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
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="w-9 h-9 rounded-lg object-contain border border-slate-100 bg-white flex-shrink-0"
                    />
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
                  <button
                    onClick={removeLogo}
                    type="button"
                    aria-label="Remove logo"
                    className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0 border-none bg-transparent cursor-pointer"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}
              <FieldError message={touched.logo ? errors.logo : undefined} />
            </div>

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

          {/* ── Footer — matches modal footer pattern from Brands list ── */}
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
              type="button"
              onClick={handleSubmit}
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
                  Save Brand
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast title={toast.title} subtitle={toast.subtitle} />}
    </div>
  );
}