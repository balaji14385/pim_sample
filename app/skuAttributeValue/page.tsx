"use client"
import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type DataType = "text" | "number" | "boolean" | "select";

interface SKU {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId:string;
}
interface Attribute {
  id: string;
  name: string;
  code: string;
  dataType: DataType;
  required: boolean;
  options?: string[];
}

interface AttributeValue {
  [attributeId: string]: string | boolean | number | undefined;
}

interface ValidationErrors {
  [attributeId: string]: string;
}

interface SubmitPayloadItem {
  skuId: string;
  attributeId: string;
  value: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  title: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ATTRIBUTES: Record<string, Attribute[]> = {
  sku1: [
    { id: "attr1", name: "Color", code: "color", dataType: "text", required: true },
    { id: "attr2", name: "RAM (GB)", code: "ram", dataType: "number", required: true },
    { id: "attr3", name: "5G Enabled", code: "fiveg", dataType: "boolean", required: false },
    { id: "attr4", name: "Storage", code: "storage", dataType: "select", required: true, options: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { id: "attr5", name: "Battery (mAh)", code: "battery", dataType: "number", required: false },
    { id: "attr6", name: "OS Version", code: "os_version", dataType: "text", required: true },
  ],
  sku2: [
    { id: "a1", name: "Color", code: "color", dataType: "text", required: true },
    { id: "a2", name: "Storage", code: "storage", dataType: "select", required: true, options: ["256 GB", "512 GB", "1 TB"] },
    { id: "a3", name: "Titanium Frame", code: "titanium", dataType: "boolean", required: false },
    { id: "a4", name: "Camera (MP)", code: "camera_mp", dataType: "number", required: false },
    { id: "a5", name: "Chip Model", code: "chip", dataType: "text", required: true },
  ],
  sku3: [
    { id: "b1", name: "Color", code: "color", dataType: "text", required: true },
    { id: "b2", name: "Noise Cancellation", code: "nc", dataType: "boolean", required: true },
    { id: "b3", name: "Battery Life (hrs)", code: "battery_hrs", dataType: "number", required: true },
    { id: "b4", name: "Connection Type", code: "connection", dataType: "select", required: true, options: ["Bluetooth 5.2", "Wired 3.5mm", "USB-C", "Multipoint"] },
  ],
  sku4: [
    { id: "c1", name: "Processor", code: "cpu", dataType: "select", required: true, options: ["Intel Core i7-13700H", "Intel Core i9-13900H"] },
    { id: "c2", name: "RAM (GB)", code: "ram", dataType: "number", required: true },
    { id: "c3", name: "Storage", code: "storage", dataType: "select", required: true, options: ["512 GB SSD", "1 TB SSD", "2 TB SSD"] },
    { id: "c4", name: "Touchscreen", code: "touch", dataType: "boolean", required: false },
    { id: "c5", name: "Color", code: "color", dataType: "text", required: false },
    { id: "c6", name: "Weight (kg)", code: "weight", dataType: "number", required: false },
  ],
  sku5: [
    { id: "d1", name: "Case Material", code: "material", dataType: "select", required: true, options: ["Natural Titanium", "Black Titanium", "Alpine Titanium", "White Titanium"] },
    { id: "d2", name: "Band Type", code: "band", dataType: "text", required: true },
    { id: "d3", name: "Cellular", code: "cellular", dataType: "boolean", required: true },
    { id: "d4", name: "Screen Size (mm)", code: "screen_mm", dataType: "number", required: false },
  ],
  sku6: [
    { id: "e1", name: "Screen Size (inches)", code: "screen_size", dataType: "number", required: true },
    { id: "e2", name: "Resolution", code: "resolution", dataType: "select", required: true, options: ["4K (3840×2160)", "8K (7680×4320)"] },
    { id: "e3", name: "Smart TV", code: "smart_tv", dataType: "boolean", required: true },
    { id: "e4", name: "Panel Type", code: "panel", dataType: "text", required: true },
    { id: "e5", name: "Refresh Rate (Hz)", code: "refresh", dataType: "number", required: false },
    { id: "e6", name: "HDR Support", code: "hdr", dataType: "boolean", required: false },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ICON
// ─────────────────────────────────────────────────────────────────────────────

interface IconProps { d: string | readonly string[]; size?: number; className?: string; }
const Icon = ({ d, size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? (d as readonly string[]).map((path, i) => <path key={i} d={path} />) : <path d={d as string} />}
  </svg>
);

const ICON_PATHS = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  chevronDown: "M19 9l-7 7-7-7",
  chevronUp: "M5 15l7-7 7 7",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  alertCircle: ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 8v4", "M12 16h.01"],
  checkCircle: ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  layers: ["M12 2L2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  package: ["M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z", "M3.27 6.96L12 12.01l8.73-5.05", "M12 22.08V12"],
  save: ["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z", "M17 21v-8H7v8", "M7 3v5h8"],
  info: ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 16v-4", "M12 8h.01"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"],
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// API SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

const fetchAttributesBySKU = async (skuId: string): Promise<Attribute[]> => {
  await new Promise((r) => setTimeout(r, 800));
  return MOCK_ATTRIBUTES[skuId] ?? [];
};
const submitAttributeValues = async (payload: SubmitPayloadItem[]): Promise<void> => {
  await new Promise((r) => setTimeout(r, 1500));
  if (Math.random() < 0.08) throw new Error("Network error. Please try again.");
  console.log("📦 Submitted Payload:", JSON.stringify(payload, null, 2));
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const validateField = (attr: Attribute, value: string | boolean | number | undefined): string => {
  if (attr.dataType === "boolean") return "";
  const raw = value as string | number | undefined;
  if (attr.required) {
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      return `${attr.name} is required`;
    }
  }
  if (attr.dataType === "number" && raw !== undefined && String(raw).trim() !== "") {
    const num = Number(raw);
    if (isNaN(num)) return `${attr.name} must be a valid number`;
    if (num < 0) return `${attr.name} must be a positive number`;
  }
  return "";
};

const validateAll = (attributes: Attribute[], values: AttributeValue): ValidationErrors => {
  const errors: ValidationErrors = {};
  attributes.forEach((attr) => {
    const msg = validateField(attr, values[attr.id]);
    if (msg) errors[attr.id] = msg;
  });
  return errors;
};

const buildPayload = (skuId: string, attributes: Attribute[], values: AttributeValue): SubmitPayloadItem[] => {
  return attributes
    .filter((attr) => {
      const v = values[attr.id];
      return v !== undefined && v !== "" && v !== null;
    })
    .map((attr) => ({ skuId, attributeId: attr.id, value: String(values[attr.id]) }));
};

const buildInitialValues = (attributes: Attribute[]): AttributeValue => {
  const initial: AttributeValue = {};
  attributes.forEach((attr) => {
    if (attr.dataType === "boolean") initial[attr.id] = false;
  });
  return initial;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const DataTypeBadge = ({ type }: { type: DataType }) => {
  const map: Record<DataType, { label: string; cls: string }> = {
    text: { label: "Text", cls: "bg-blue-50 text-blue-600 ring-1 ring-blue-200" },
    number: { label: "Number", cls: "bg-amber-50 text-amber-600 ring-1 ring-amber-200" },
    boolean: { label: "Bool", cls: "bg-purple-50 text-purple-600 ring-1 ring-purple-200" },
    select: { label: "Select", cls: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" },
  };
  const { label, cls } = map[type];
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{label}</span>
  );
};

const FieldError = ({ message }: { message: string }) => (
  <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-500 animate-[fadeIn_0.15s_ease]">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    {message}
  </p>
);

interface DynamicFieldProps {
  attr: Attribute;
  value: string | boolean | number | undefined;
  error: string;
  disabled: boolean;
  onChange: (attrId: string, value: string | boolean | number) => void;
  onBlur: (attrId: string) => void;
}

const DynamicField = ({ attr, value, error, disabled, onChange, onBlur }: DynamicFieldProps) => {
  const baseInputCls = `w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${error ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 bg-white hover:border-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100/60"}`;
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 select-none";

  if (attr.dataType === "boolean") {
    const checked = Boolean(value);
    return (
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          {attr.name}
          {attr.required && <span className="ml-1 text-red-500">*</span>}
          <span className="ml-1.5"><DataTypeBadge type="boolean" /></span>
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(attr.id, !checked)}
          className={`group flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 text-left disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"}`}
        >
          <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${checked ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 shadow-md shadow-green-200" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
            {checked && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="flex-1">{checked ? "Yes — Enabled" : "No — Disabled"}</span>
          {checked && <span className="text-xs font-semibold text-green-600 bg-green-100 rounded-full px-2 py-0.5">Active</span>}
        </button>
      </div>
    );
  }

  if (attr.dataType === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          {attr.name}
          {attr.required && <span className="ml-1 text-red-500">*</span>}
          <span className="ml-1.5"><DataTypeBadge type="select" /></span>
        </label>
        <div className="relative">
          <select
            value={(value as string) ?? ""}
            disabled={disabled}
            onChange={(e) => onChange(attr.id, e.target.value)}
            onBlur={() => onBlur(attr.id)}
            className={`${baseInputCls} pr-10 appearance-none cursor-pointer`}
          >
            <option value="" disabled>Select {attr.name}…</option>
            {(attr.options ?? []).map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Icon d={ICON_PATHS.chevronDown} size={14} />
          </div>
        </div>
        {error && <FieldError message={error} />}
      </div>
    );
  }

  if (attr.dataType === "number") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          {attr.name}
          {attr.required && <span className="ml-1 text-red-500">*</span>}
          <span className="ml-1.5"><DataTypeBadge type="number" /></span>
        </label>
        <input
          type="number"
          min={0}
          value={value !== undefined ? String(value) : ""}
          disabled={disabled}
          placeholder={`Enter ${attr.name.toLowerCase()}…`}
          onChange={(e) => onChange(attr.id, e.target.value)}
          onBlur={() => onBlur(attr.id)}
          className={baseInputCls}
        />
        {error ? <FieldError message={error} /> : <p className="text-[11px] text-slate-400">Numeric values only</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>
        {attr.name}
        {attr.required && <span className="ml-1 text-red-500">*</span>}
        <span className="ml-1.5"><DataTypeBadge type="text" /></span>
      </label>
      <input
        type="text"
        value={(value as string) ?? ""}
        disabled={disabled}
        placeholder={`Enter ${attr.name.toLowerCase()}…`}
        onChange={(e) => onChange(attr.id, e.target.value)}
        onBlur={() => onBlur(attr.id)}
        className={baseInputCls}
      />
      {error && <FieldError message={error} />}
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-xl min-w-[300px] max-w-sm border backdrop-blur-sm animate-[slideInRight_0.3s_cubic-bezier(0.34,1.56,0.64,1)] ${toast.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white" : "bg-gradient-to-r from-red-500 to-rose-600 border-red-400 text-white"}`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {toast.type === "success" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">{toast.title}</p>
          <p className="text-xs opacity-90 mt-0.5 leading-snug">{toast.message}</p>
        </div>
        <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    ))}
  </div>
);

interface SKUDropdownProps {
  skus: SKU[];
  selected: SKU | null;
  loading: boolean;
  disabled: boolean;
  onSelect: (sku: SKU) => void;
}

const SKUDropdown = ({ skus, selected, loading, disabled, onSelect }: SKUDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = skus.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.code.toLowerCase().includes(filter.toLowerCase()) ||
      s.category.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 text-left disabled:cursor-not-allowed disabled:opacity-60 ${open ? "border-green-400 ring-2 ring-green-100/60 bg-white" : "border-slate-200 bg-white hover:border-slate-300"}`}
      >
        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-green-200">
          <Icon d={ICON_PATHS.tag} size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="font-semibold text-slate-800 truncate">{selected.name}</p>
              <p className="text-xs text-slate-400 font-normal">{selected.code} · {selected.category}</p>
            </>
          ) : (
            <p className="text-slate-400 font-normal">Search and select a SKU…</p>
          )}
        </div>
        {loading ? (
          <svg className="animate-spin text-green-500" width={16} height={16} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Icon d={open ? ICON_PATHS.chevronUp : ICON_PATHS.chevronDown} size={16} className="text-slate-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 min-w-[500px] mt-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/80 overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Icon d={ICON_PATHS.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name, code or category…"
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-xs font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">No SKUs match &ldquo;{filter}&rdquo;</div>
            ) : (
              filtered.map((sku) => {
                const isSelected = selected?.id === sku.id;
                return (
                  <button
                    key={sku.id}
                    type="button"
                    onClick={() => { onSelect(sku); setOpen(false); setFilter(""); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all duration-150 ${isSelected ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <div className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"}`}>
                      {sku.code.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold break-words">{sku.name}</p>
                      <p className="text-[11px] text-slate-400">{sku.code} · {sku.category}</p>
                    </div>
                    {isSelected && <Icon d={ICON_PATHS.check} size={14} className="text-green-600 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FieldSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="h-3.5 w-28 rounded-full bg-slate-200" />
    <div className="h-11 w-full rounded-xl bg-slate-100" />
  </div>
);

const EmptyState = ({ icon, title, description }: { icon: string | readonly string[]; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
      <Icon d={icon} size={28} className="text-slate-400" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>
      <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SKUAttributeForm() {
  const [skuLoading, setSkuLoading] = useState(true);

  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attrsLoading, setAttrsLoading] = useState(false);

  const [values, setValues] = useState<AttributeValue>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [submitting, setSubmitting] = useState(false);
  const [lastPayload, setLastPayload] = useState<SubmitPayloadItem[] | null>(null);
  const [showPayload, setShowPayload] = useState(false);
const [sku, setSku] = useState<SKU[]>([]);
const [formData, setFormData] = useState<Attribute[]>([]);
   useEffect(() => {
  async function slist() {
    try {
      const data = await fetch("/api/skuList");
      const finalData = await data.json();
      setSku(finalData.data || []);
    } catch (err:any) {
      console.error(err);
    } finally {
      setSkuLoading(false);
    }
  }

  slist();
}, []);
useEffect(() => {
  if (!selectedSku) return;

  async function disAtr() {
    try {
      setAttrsLoading(true);

      const res = await fetch("/api/attributeList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id:selectedSku!.categoryId,
        }),
      });

      const data = await res.json();
      const attrs: Attribute[] = (data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        dataType: item.dataType,
        required: item.required,
        options: item.options || [],
      }));

      setAttributes(attrs);
      setValues(buildInitialValues(attrs));
    } catch (err:any) {
      console.error(err);
      addToast(
        "error",
        "Failed",
        "Unable to load attributes"
      );
    } finally {
      setAttrsLoading(false);
    }
  }

  disAtr();
}, [selectedSku]);
  const apiSkus: SKU[] = sku.map((item: any) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  category: item.category,
  categoryId:item.categoryId
}));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  const addToast = useCallback((type: "success" | "error", title: string, message: string) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSelectSku = useCallback((sku: SKU) => {
  setSelectedSku(sku);

  setAttributes([]);
  setValues({});
  setErrors({});
  setTouched({});

  setLastPayload(null);
  setShowPayload(false);
}, []);

  const handleChange = useCallback((attrId: string, value: string | boolean | number) => {
    setValues((prev) => ({ ...prev, [attrId]: value }));
    setErrors((prev) => {
      if (!prev[attrId]) return prev;
      const next = { ...prev };
      delete next[attrId];
      return next;
    });
  }, []);

  const handleBlur = useCallback(
    (attrId: string) => {
      setTouched((prev) => ({ ...prev, [attrId]: true }));
      const attr = attributes.find((a) => a.id === attrId);
      if (!attr) return;
      const msg = validateField(attr, values[attrId]);
      setErrors((prev) => {
        if (!msg) {
          const next = { ...prev };
          delete next[attrId];
          return next;
        }
        return { ...prev, [attrId]: msg };
      });
    },
    [attributes, values]
  );

  const handleReset = useCallback(() => {
    setValues(buildInitialValues(attributes));
    setErrors({});
    setTouched({});
    setLastPayload(null);
    setShowPayload(false);
  }, [attributes]);

  const handleSubmit = useCallback(async () => {
    if (!selectedSku || submitting) return;

    const allTouched: Record<string, boolean> = {};
    attributes.forEach((a) => (allTouched[a.id] = true));
    setTouched(allTouched);

    const allErrors = validateAll(attributes, values);
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      addToast("error", "Validation failed", `Please fix ${Object.keys(allErrors).length} error(s) before saving.`);
      return;
    }

    setSubmitting(true);
    const payload = buildPayload(selectedSku.id, attributes, values);
    console.log(payload)
    try {
      const res = await fetch("/api/skuAttributeValue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
     console.log(data)
     if (res.ok && data?.status) {
    setLastPayload(payload);
    setShowPayload(true);

    addToast(
      "success",
      "Saved successfully!",
      `${payload.length} attribute value(s) saved for ${selectedSku.code}.`
    );

  setValues(buildInitialValues(attributes));
setSelectedSku(null);
  setAttributes([]);
  setValues({});
  setErrors({});
  setTouched({});
  setLastPayload(null);
  setShowPayload(false);  } else {
    addToast(
      "error",
      "Save failed",
      data?.message || "Unable to save data."
    );
  }
    } catch (err: any) {
      addToast("error", "Save failed","already exist");
    } finally {
      setSubmitting(false);
    }
  }, [selectedSku, submitting, attributes, values, addToast]);

  const totalRequired = attributes.filter((a) => a.required).length;
  const filledRequired = attributes.filter((a) => {
    if (!a.required) return false;
    if (a.dataType === "boolean") return true;
    const v = values[a.id];
    return v !== undefined && v !== "" && v !== null;
  }).length;
  const totalFilled = attributes.filter((a) => {
    const v = values[a.id];
    if (a.dataType === "boolean") return true;
    return v !== undefined && v !== "" && v !== null;
  }).length;
  const errorCount = Object.keys(errors).length;
  const validationErrors = Object.entries(errors);
  const completionPct = attributes.length ? Math.round((totalFilled / attributes.length) * 100) : 0;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200 flex-shrink-0">
                <Icon d={ICON_PATHS.layers} size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 leading-none">SKU Attribute Values</h1>
                <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <span>Products</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                  <span>SKU Manager</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                  <span className="text-green-600 font-semibold">Attribute Values</span>
                </nav>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedSku && !attrsLoading && attributes.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Icon d={ICON_PATHS.refresh} size={13} />
                  Reset Form
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex gap-5 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-5">
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible min-h-[220px]">                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon d={ICON_PATHS.tag} size={15} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Select SKU</p>
                    <p className="text-[11px] text-slate-400">Choose a product SKU to manage its attribute values</p>
                  </div>
                </div>
                <div className="p-5">
<SKUDropdown
  skus={apiSkus}
  selected={selectedSku}
  loading={skuLoading}
  disabled={submitting}
  onSelect={handleSelectSku}
/>                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Icon d={ICON_PATHS.package} size={15} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        Attribute Values
                        {!attrsLoading && attributes.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-200">{attributes.length} fields</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedSku ? `Configuring: ${selectedSku.name}` : "Select a SKU to load attribute fields"}
                      </p>
                    </div>
                  </div>
                  {selectedSku && !attrsLoading && attributes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-700">{completionPct}%</p>
                        <p className="text-[10px] text-slate-400">filled</p>
                      </div>
                      <div className="h-8 w-8 relative">
                        <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="12" fill="none" stroke="#f1f5f9" strokeWidth={4} />
                          <circle cx="16" cy="16" r="12" fill="none" stroke={completionPct === 100 ? "#10b981" : "#16a34a"} strokeWidth={4} strokeDasharray={`${(completionPct / 100) * 75.4} 75.4`} strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {attrsLoading ? (
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {Array.from({ length: 6 }).map((_, i) => (<FieldSkeleton key={i} />))}
                    </div>
                  ) : !selectedSku ? (
                    <EmptyState icon={ICON_PATHS.layers} title="No SKU Selected" description="Search and select a SKU from the dropdown above to begin configuring attribute values." />
                  ) : attributes.length === 0 ? (
                    <EmptyState icon={ICON_PATHS.info} title="No Attributes Found" description="This SKU does not have any configurable attributes assigned to it." />
                  ) : (
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {attributes.map((attr) => (
                        <DynamicField
                          key={attr.id}
                          attr={attr}
                          value={values[attr.id]}
                          error={touched[attr.id] ? (errors[attr.id] ?? "") : ""}
                          disabled={submitting}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {selectedSku && !attrsLoading && attributes.length > 0 && (
                  <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 backdrop-blur-sm px-5 py-3.5 flex items-center justify-between gap-4 shadow-[0_-4px_16px_-4px_rgba(15,23,42,0.08)]">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${errorCount > 0 ? "bg-red-500 animate-pulse" : filledRequired === totalRequired ? "bg-green-500" : "bg-amber-400"}`} />
                      <span className="text-xs font-medium text-slate-600">
                        {errorCount > 0 ? `${errorCount} validation error(s)` : `${filledRequired} / ${totalRequired} required fields filled`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={submitting}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon d={ICON_PATHS.refresh} size={13} />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all duration-200 shadow-md disabled:cursor-not-allowed disabled:opacity-70 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200 hover:shadow-green-300 active:scale-[0.98]"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="white" strokeWidth={4} />
                              <path className="opacity-80" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving…
                          </>
                        ) : (
                          <>
                            <Icon d={ICON_PATHS.save} size={14} />
                            Save Attribute Values
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon d={ICON_PATHS.eye} size={13} className="text-green-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Form Summary</p>
                </div>
                <div className="p-4 flex flex-col gap-0">
                  {[
                    { label: "Selected SKU", value: selectedSku?.code ?? "—", highlight: !!selectedSku },
                    { label: "Product Name", value: selectedSku?.name ?? "—" },
                    { label: "Category", value: selectedSku?.category ?? "—" },
                    { label: "Total Attributes", value: attributes.length > 0 ? String(attributes.length) : "—" },
                    { label: "Required Fields", value: totalRequired > 0 ? `${filledRequired} / ${totalRequired}` : "—" },
                    { label: "Completion", value: attributes.length > 0 ? `${completionPct}%` : "—" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <span className="text-[11px] font-medium text-slate-400">{label}</span>
                      <span className={`text-[12px] font-bold truncate max-w-[140px] ${highlight ? "text-green-600" : "text-slate-700"}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSku && !attrsLoading && attributes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${validationErrors.length > 0 ? "bg-red-50" : "bg-green-50"}`}>
                      <Icon d={validationErrors.length > 0 ? ICON_PATHS.alertCircle : ICON_PATHS.checkCircle} size={13} className={validationErrors.length > 0 ? "text-red-500" : "text-green-600"} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Validation</p>
                  </div>
                  <div className="p-3">
                    {validationErrors.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
                        <Icon d={ICON_PATHS.check} size={13} />
                        All visible fields are valid
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {validationErrors.map(([attrId, msg]) => {
                          const attr = attributes.find((a) => a.id === attrId);
                          return (
                            <div key={attrId} className="flex items-start gap-2 text-[11px] font-medium text-red-600 bg-red-50 rounded-lg px-2.5 py-2 leading-snug">
                              <svg className="mt-0.5 flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <span><strong>{attr?.name ?? attrId}:</strong> {msg}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSku && !attrsLoading && attributes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPayload((v) => !v)}
                    className="w-full px-4 py-3.5 border-b border-slate-100 flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon d={ICON_PATHS.code} size={13} className="text-slate-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide flex-1 text-left">Payload Preview</p>
                    <Icon d={showPayload ? ICON_PATHS.chevronUp : ICON_PATHS.chevronDown} size={13} className="text-slate-400" />
                  </button>
                  {showPayload && (
                    <div className="p-3">
                      {lastPayload && lastPayload.length > 0 ? (
                        <div className="bg-slate-900 rounded-xl p-3 overflow-auto max-h-64 text-[10.5px] font-mono leading-relaxed">
                          <pre className="text-slate-300 whitespace-pre-wrap break-all">{JSON.stringify(lastPayload, null, 2)}</pre>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-4">Submit the form to see the payload</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}