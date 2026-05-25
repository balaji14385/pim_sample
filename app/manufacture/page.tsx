"use client"
import React, { useState } from "react";

type FormData = {
  companyName: string;
  gstNumber: string;
  address: string;
};

type Errors = {
  companyName?: string;
  gstNumber?: string;
  address?: string;
};

const AddManufacturer = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    gstNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    let newErrors: Errors = {};

    const companyName =
      formData.companyName.trim();

    const gst =
      formData.gstNumber.trim().toUpperCase();

    const address =
      formData.address.trim();


    /*
    ==========================
    Company Name Validation
    ==========================
    */

    if (!companyName) {
      newErrors.companyName =
        "Company Name is required";
    }

    else if (companyName.length < 3) {
      newErrors.companyName =
        "Minimum 3 characters required";
    }

    else if (companyName.length > 100) {
      newErrors.companyName =
        "Maximum 100 characters allowed";
    }

    else if (
      !/^[A-Za-z0-9&.\-\s]+$/.test(companyName)
    ) {
      newErrors.companyName =
        "Invalid company name";
    }



    /*
    ==========================
    GST Validation
    ==========================
    */
     if(!gst){
        
        newErrors.gstNumber ="GST must be required";
       } 
    if (gst) {

      const gstRegex =
/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;
          
      if (gst.length !== 15) {

        newErrors.gstNumber =
          "GST must contain 15 characters";

      }

      else if (!gstRegex.test(gst)) {

        newErrors.gstNumber =
          "Invalid GST format";

      }

    }



    /*
    ==========================
    Address Validation
    ==========================
    */

    if (!address) {

      newErrors.address =
        "Address is required";

    }

    else if (address.length < 10) {

      newErrors.address =
        "Address must contain minimum 10 characters";

    }

    else if (address.length > 250) {

      newErrors.address =
        "Address cannot exceed 250 characters";

    }



    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
};  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccess("");

    if (!validate()) return;

    setLoading(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      console.log(formData);
      let res=await fetch('/api/manufacturer',{
        'method':'post',
        'headers':{
            'Content-Type':'application/json',

        },
        'body':JSON.stringify(formData)
       })
       let data=await res.json()
       console.log(data)
      if(data.status==true)
      {
        setSuccess("Manufacturer added successfully");

      setFormData({
        companyName: "",
        gstNumber: "",
        address: "",
      });
      }

    } catch {
      alert("Failed to save manufacturer");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-6">

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-xl p-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            BOXAIO
          </h1>

          <p className="text-gray-500">
            Product Information Management System
          </p>

        </div>


        <h2 className="text-2xl font-semibold mb-6">
            Add Manufacturer
        </h2>


        <form onSubmit={handleSubmit}>

          {/* Company Name */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">
              Company Name
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.companyName}
              </p>
            )}

          </div>


          {/* GST */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">
              GST Number
            </label>

            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="29ABCDE1234F1Z5"
              maxLength={15}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.gstNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.gstNumber}
              </p>
            )}

          </div>


          {/* Address */}

          <div className="mb-6">

            <label className="block mb-2 font-medium">
              Address
            </label>

            <textarea
              rows={4}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter manufacturer address"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address}
              </p>
            )}

          </div>


          {/* Success */}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-5">
              {success}
            </div>
          )}


          {/* Save Button */}

          <button
            type="submit"
            disabled={loading}
            className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-8
            py-3
            rounded-lg
            w-full
            font-medium
            disabled:bg-gray-400
            "
          >

            {loading
              ? "Saving..."
              : "Save Manufacturer"}

          </button>

        </form>

      </div>

    </div>
  );
};

export default AddManufacturer;