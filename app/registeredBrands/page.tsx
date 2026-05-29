"use client";

import { useState, useEffect } from "react";

type Brand = {
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

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    async function display() {
     try {
       let res = await fetch("/api/registeredBrands");
      let data = await res.json();

      console.log(data);
      setBrands(data.data);
     } catch (error:unknown) {
        console.log(error.message)
     }
    }

    display();
  }, []);

  const formatBrandType = (type: string) =>
    type
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Brands
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and view all registered brands
            </p>
          </div>
 
          <div className="rounded-xl border bg-white px-4 py-2 shadow-sm">
            <p className="text-xs text-slate-500">
              Total Brands
            </p>

            <p className="text-xl font-bold text-indigo-600">
              {brands.length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          <div className="overflow-x-auto">
            <table className="min-w-full">

              {/* Header */}
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Brand",
                    "Parent Brand",
                    "Code",
                    "Type",
                    "Company",
                    "Products",
                    "Status",
                    "Created",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100">

                {brands.map((brand) => (
                  <tr
                    key={brand.brandCode}
                    className="group transition-all duration-300 hover:bg-indigo-50/40"
                  >
                    {/* Brand */}
                    <td className="px-3 py-5">

                      <div className="flex items-center gap-4">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow">
                          {initials(brand.brandName)}
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {brand.brandName}
                          </h3>

                          <p className="text-xs text-slate-500 truncate max-w-[150px]">
                            {brand.logo || "No logo"}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Parent Brand */}
                    <td className="px-6 py-5">

                      {brand.parentBrandName ? (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                          {brand.parentBrandName}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                          Independent
                        </span>
                      )}

                    </td>

                    {/* Code */}
                    <td className="px-6 py-5">

                      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-semibold">
                        {brand.brandCode}
                      </span>

                    </td>

                    {/* Type */}
                    <td className="px-6 py-5">

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {formatBrandType(
                          brand.brandType
                        )}
                      </span>

                    </td>

                    {/* Company */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {brand.companyName}
                    </td>

                    {/* Product Count */}
                    <td className="px-6 py-5">

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm">
                        {brand.productCount}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          brand.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {brand.status
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    {/* Created */}
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(
                        brand.createdAt
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-4 text-sm text-slate-500">

            <span>
              Showing {brands.length} brand
              {brands.length > 1 ? "s" : ""}
            </span>

            <span>
              Updated just now
            </span>

          </div>
        </div>
      </div>
    </div>
  );
}