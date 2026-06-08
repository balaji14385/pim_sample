"use client";

import { useState,useEffect, ChangeEvent, FocusEvent, FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface CategoryOption {
  id: string;
  name: string;
}

interface DataTypeOption {
  id: string;
  name: string;
}

interface FormValues {
  categoryId: string;
  name: string;
  code: string;
  dataType: string;
  isFilterable: boolean;
  isRequired: boolean;
}

interface FormErrors {
  categoryId?: string;
  name?: string;
  code?: string;
  dataType?: string;
}

type TextFieldName = "name" | "code";
type SelectFieldName = "categoryId" | "dataType";
type FieldName = TextFieldName | SelectFieldName;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ATTR_NAME_REGEX = /^[A-Za-z][A-Za-z0-9 _-]*$/;
const ATTR_CODE_REGEX = /^[A-Z][A-Z0-9]*$/;

const INITIAL_VALUES: FormValues = {
  categoryId: "",
  name: "",
  code: "",
  dataType: "",
  isFilterable: false,
  isRequired: false,
};

const CATEGORIES: CategoryOption[] = [
  { id: "CAT-1001", name: "Electronics" },
  { id: "CAT-1002", name: "Apparel & Fashion" },
  { id: "CAT-1003", name: "Home & Furniture" },
  { id: "CAT-1004", name: "Beauty & Personal Care" },
  { id: "CAT-1005", name: "Grocery & Essentials" },
  { id: "CAT-1006", name: "Sports & Outdoors" },
];

const DATA_TYPES: DataTypeOption[] = [
  { id: "string", name: "String (Text)" },
  { id: "number", name: "Number (Integer)" },
  { id: "decimal", name: "Decimal" },
  { id: "boolean", name: "Boolean (Yes / No)" },
  { id: "date", name: "Date" },
  { id: "enum", name: "Enum (Predefined list)" },
];

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateField(field: FieldName, value: string): string {
  const v = value.trim();
  switch (field) {
    case "categoryId":
      if (!v) return "Category is required";
      return "";
    case "name":
      if (!value) return "Attribute Name is required";
      if (!v) return "Attribute Name cannot be only spaces";
      if (v.length < 2) return "Minimum 2 characters required";
      if (v.length > 50) return "Maximum 50 characters allowed";
      if (!ATTR_NAME_REGEX.test(v))
        return "Use letters, numbers, spaces, _ or - (start with a letter)";
      return "";
    case "code":
      if (!value) return "Attribute Code is required";
      if (!v) return "Attribute Code cannot be only spaces";
      if (v.length < 2) return "Minimum 2 characters required";
      if (v.length > 40) return "Maximum 40 characters allowed";
      if (!ATTR_CODE_REGEX.test(v))
        return "Uppercase letters and numbers only (start with an uppercase letter)";      return "";
    case "dataType":
      if (!v) return "Data Type is required";
      return "";
    default:
      return "";
  }
}

function validateAll(values: FormValues): FormErrors {
  return {
    categoryId: validateField("categoryId", values.categoryId),
    name: validateField("name", values.name),
    code: validateField("code", values.code),
    dataType: validateField("dataType", values.dataType),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
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
  folder: [
    "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  ],
  tag: [
    "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
    "M7 7h.01",
  ],
  hash: ["M4 9h16", "M4 15h16", "M10 3L8 21", "M16 3l-2 18"],
  type: ["M4 7V4h16v3", "M9 20h6", "M12 4v16"],
  chevron: ["M6 9l6 6 6-6"],
  check: ["M20 6L9 17l-5-5"],
  alert: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  save: [
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",
    "M17 21v-8H7v8",
    "M7 3v5h8",
  ],
};

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function AddAttributePage() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [category,setCategory]=useState<CategoryOption []>([])
   async function clist(){
        try {
           let data= await fetch('/api/categoriesList')
         let finalData=await data.json()
          setCategory(finalData.data)
        } catch (error:any) {
          console.log(error.message)
        }finally {
      setLoading(false);
    }
       }
  useEffect(()=>{
   clist()
  },[])
  console.log(category)
  const fieldState = (field: FieldName): "error" | "ok" | "" => {
    if (!touched[field]) return "";
    if (errors[field]) return "error";
    const v =
      field === "categoryId"
        ? values.categoryId
        : field === "dataType"
        ? values.dataType
        : values[field];
    if (v.trim()) return "ok";
    return "";
  };

  const inputCls = (field: FieldName, extra = ""): string => {
    const state = fieldState(field);
    const base =
      "w-full bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-300 placeholder:text-[13px] outline-none transition-all duration-200 pl-10 pr-9 py-2.5 font-sans hover:bg-white hover:border-slate-300";
    const states: Record<string, string> = {
      error: "border-red-400 ring-2 ring-red-400/10 bg-red-50 hover:bg-red-50",
      ok: "border-emerald-400 ring-2 ring-emerald-400/10 bg-white hover:bg-white",
      "": "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white",
    };
    return `${base} ${states[state] ?? states[""]} ${extra}`;
  };

  const fireFieldToast = (field: FieldName, message: string) => {
    toast.error(message, { id: `err-${field}`, duration: 3000 });
  };

  const handleTextChange =
    (field: TextFieldName) => (e: ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (field === "code") val = val.toUpperCase();
      setValues((prev) => {
        const next = { ...prev, [field]: val };
        if (touched[field]) {
          const err = validateField(field, val);
          setErrors((p) => ({ ...p, [field]: err }));
        } else {
          setErrors((p) => ({ ...p, [field]: "" }));
        }
        return next;
      });
    };

  const handleSelectChange =
    (field: SelectFieldName) => (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [field]: val }));
      const err = validateField(field, val);
      setErrors((p) => ({ ...p, [field]: err }));
      setTouched((p) => ({ ...p, [field]: true }));
      if (err) fireFieldToast(field, err);
    };

  const handleBlur =
    (field: FieldName) =>
    (_: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const value =
        field === "categoryId"
          ? values.categoryId
          : field === "dataType"
          ? values.dataType
          : values[field];
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
      if (err) fireFieldToast(field, err);
    };

  const handleCheckbox =
    (field: "isFilterable" | "isRequired") => (e: ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setValues((prev) => ({ ...prev, [field]: checked }));
    };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched({});
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({
      categoryId: true,
      name: true,
      code: true,
      dataType: true,
    });
    const newErrors = validateAll(values);
    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      const order: FieldName[] = [
        "categoryId",
        "name",
        "code",
        "dataType",
      ];
      const firstField = order.find((k) => newErrors[k]);
      if (firstField) fireFieldToast(firstField, newErrors[firstField] as string);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
       let res=await fetch('/api/attributes',{
        'method':'post',
        'headers':{
            'Content-Type':'application/json',

        },
        'body':JSON.stringify(values)
       })
       console.log(values)
       let data=await res.json()
       console.log(data)
      if(data.status==true)
      {
         const cat = CATEGORIES.find((c) => c.id === values.categoryId);
      toast.success(
        `Attribute "${values.name.trim()}" added to ${cat?.name ?? "category"}`,
        { id: "attr-success", duration: 3500 },
      );
         handleReset();
         return ;
      }
            toast.error("Failed to save attribute", { id: "attr-fail" });

    } catch {
      toast.error("Failed to save attribute", { id: "attr-fail" });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === values.categoryId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#1e293b",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
            fontSize: "13px",
          },
        }}
      />

      {/* Top brand bar */}
     

      <main className="flex-1 max-w-[700px] mx-auto w-full px-6 pt-9 pb-20">
        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h2 className="text-[22px] font-medium text-slate-800 tracking-tight">
              Add Attribute
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Define a new product attribute under an existing category
            </p>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 flex-shrink-0">
            <span className="text-red-500 text-sm leading-none">*</span> Required
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-white/90 backdrop-blur border border-slate-200 rounded-2xl px-8 py-7 shadow-[0_10px_40px_-20px_rgba(16,185,129,0.25)] overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Attribute details
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="categoryId"
                  className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                >
                  Category
                  <span className="text-red-500 text-sm leading-none normal-case">
                    *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.folder} size={15} />
                  </span>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={values.categoryId}
                    onChange={handleSelectChange("categoryId")}
                    onBlur={handleBlur("categoryId")}
                    className={`${inputCls("categoryId")} appearance-none cursor-pointer`}
                  >
                    <option value="">Select a category</option>
                    {
           category.map((e)=>{

    return <option key={e.id} value={e.id}>{e.name}</option>
   })}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon d={ICONS.chevron} size={14} />
                  </span>
                </div>
                {touched.categoryId && errors.categoryId ? (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <Icon d={ICONS.alert} size={12} />
                    {errors.categoryId}
                  </p>
                ) : selectedCategory ? (
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {selectedCategory.id}
                  </p>
                ) : null}
              </div>

              {/* Attribute Name + Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Attribute Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                  >
                    Attribute name
                    <span className="text-red-500 text-sm leading-none normal-case">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                      <Icon d={ICONS.tag} size={15} />
                    </span>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="e.g. Screen Size"
                      value={values.name}
                      onChange={handleTextChange("name")}
                      onBlur={handleBlur("name")}
                      className={inputCls("name")}
                      maxLength={50}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {fieldState("name") === "ok" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <Icon d={ICONS.check} size={14} sw={2.2} />
                      </span>
                    )}
                  </div>
                  {touched.name && errors.name ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                      <Icon d={ICONS.alert} size={12} />
                      {errors.name}
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-400">
                      2–50 chars · readable label
                    </p>
                  )}
                </div>

                {/* Attribute Code */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="code"
                    className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                  >
                    Attribute code
                    <span className="text-red-500 text-sm leading-none normal-case">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                      <Icon d={ICONS.hash} size={15} />
                    </span>
                    <input
                      id="code"
                      type="text"
                      name="code"
                      placeholder="e.g. SCREENSIZE"
                      value={values.code}
                      onChange={handleTextChange("code")}
                      onBlur={handleBlur("code")}
                      className={`${inputCls("code")} font-mono tracking-wide`}
                      maxLength={40}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {fieldState("code") === "ok" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <Icon d={ICONS.check} size={14} sw={2.2} />
                      </span>
                    )}
                  </div>
                  {touched.code && errors.code ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                      <Icon d={ICONS.alert} size={12} />
                      {errors.code}
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-400">
                      uppercase, numbers, _ only
                    </p>
                  )}
                </div>
              </div>

              {/* Data Type */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="dataType"
                  className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500"
                >
                  Data type
                  <span className="text-red-500 text-sm leading-none normal-case">
                    *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icon d={ICONS.type} size={15} />
                  </span>
                  <select
                    id="dataType"
                    name="dataType"
                    value={values.dataType}
                    onChange={handleSelectChange("dataType")}
                    onBlur={handleBlur("dataType")}
                    className={`${inputCls("dataType")} appearance-none cursor-pointer`}
                  >
                    <option value="">Select a data type</option>
                    {DATA_TYPES.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon d={ICONS.chevron} size={14} />
                  </span>
                </div>
                {touched.dataType && errors.dataType ? (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600">
                    <Icon d={ICONS.alert} size={12} />
                    {errors.dataType}
                  </p>
                ) : (
                  <p className="text-[11px] font-mono text-slate-400">
                    Defines how values are stored & validated
                  </p>
                )}
              </div>

              {/* Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label
                  htmlFor="isFilterable"
                  className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-slate-50 px-4 py-3 transition-all hover:bg-white ${
                    values.isFilterable
                      ? "border-emerald-400 ring-2 ring-emerald-400/10 bg-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="leading-tight">
                    <p className="text-[13px] font-medium text-slate-800">
                      Filterable
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Use in storefront filters
                    </p>
                  </div>
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      values.isFilterable
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        values.isFilterable ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <input
                    id="isFilterable"
                    type="checkbox"
                    className="sr-only"
                    checked={values.isFilterable}
                    onChange={handleCheckbox("isFilterable")}
                  />
                </label>

                <label
                  htmlFor="required"
                  className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-slate-50 px-4 py-3 transition-all hover:bg-white ${
                    values.isRequired
                      ? "border-emerald-400 ring-2 ring-emerald-400/10 bg-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="leading-tight">
                    <p className="text-[13px] font-medium text-slate-800">
                      Required
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Must be filled on products
                    </p>
                  </div>
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      values.isRequired
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        values.isRequired ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <input
                    id="required"
                    type="checkbox"
                    className="sr-only"
                    checked={values.isRequired}
                    onChange={handleCheckbox("isRequired")}
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                 className="group relative inline-flex items-center gap-2
                 md:px-5 md:py-2.5 px-2 py-1.5 font-small rounded-lg text-sm md:font-semibold 
                 text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Icon d={ICONS.save} size={15} sw={2} />
                    Save Attribute
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          BOXAIO · PIM Enterprise · Attributes
        </p>
      </main>
    </div>
  );
}