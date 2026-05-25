"use client"
import React, { useState } from "react";

type FormData = {
  brandName: string;
  brandType: string;
  manufacturer: string;
  parentBrand: string;
  segment: string;
  country: string;
  description: string;
  logo: File | null;
};

type Errors = {
  brandName?: string;
  brandType?: string;
  manufacturer?: string;
  parentBrand?: string;
  segment?: string;
  country?: string;
  description?: string;
  logo?: string;
};

const AddBrand = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] =
    useState<FormData>({
      brandName: "",
      brandType: "",
      manufacturer: "",
      parentBrand: "",
      segment: "",
      country: "",
      description: "",
      logo: null,
    });

  const [errors, setErrors] =
    useState<Errors>({});



  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement
        >
      | React.ChangeEvent<
          HTMLSelectElement
        >
      | React.ChangeEvent<
          HTMLTextAreaElement
        >
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


  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
  };



  const validate = () => {
    let newErrors: Errors = {};

    /*
    Brand Name
    */

    if (!formData.brandName.trim()) {
      newErrors.brandName =
        "Brand Name required";
    }

    else if (
      formData.brandName.length < 2
    ) {
      newErrors.brandName =
        "Minimum 2 characters";
    }

    else if (
      formData.brandName.length > 100
    ) {
      newErrors.brandName =
        "Maximum 100 characters";
    }

    /*
    Brand Type
    */

    if (!formData.brandType) {
      newErrors.brandType =
        "Select Brand Type";
    }


    /*
    Manufacturer
    */

    if (!formData.manufacturer) {
      newErrors.manufacturer =
        "Select Manufacturer";
    }


    /*
    Segment
    */

    if (!formData.segment) {
      newErrors.segment =
        "Select Segment";
    }


    /*
    Country
    */

    if (!formData.country) {
      newErrors.country =
        "Select Country";
    }


    /*
    Description
    */

    if (
      formData.description.length >
      500
    ) {
      newErrors.description =
        "Max 500 characters";
    }

    if (
      formData.description &&
      formData.description.length < 10
    ) {
      newErrors.description =
        "Minimum 10 characters";
    }



    /*
    Logo Upload
    */

    if (formData.logo) {
      const valid =
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];

      if (
        !valid.includes(
          formData.logo.type
        )
      ) {
        newErrors.logo =
          "Only image files allowed";
      }

      if (
        formData.logo.size >
        2 * 1024 * 1024
      ) {
        newErrors.logo =
          "Image max size 2MB";
      }
    }



    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };



  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSuccess("");

    if (!validate()) return;

    setLoading(true);

    await new Promise((r) =>
      setTimeout(r, 1000)
    );

    console.log(formData);

    setSuccess(
      "Brand created successfully"
    );

    setLoading(false);
  };



  return (
<div className="bg-slate-100 min-h-screen p-8">

<div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

{/* HEADER */}

<div className="mb-8">

<h1 className="text-3xl font-bold">
BOXAIO
</h1>

<p className="text-gray-500">
Product Information Management
</p>

</div>


<h2 className="text-2xl font-semibold mb-8">
Add Brand
</h2>


<form
onSubmit={handleSubmit}
className="space-y-6"
>


{/* Brand Name */}

<div>

<label>
Brand Name *
</label>

<input
type="text"
name="brandName"
value={
formData.brandName
}
onChange={handleChange}
className="w-full border p-3 rounded mt-2"
/>

<p className="text-red-500 text-sm">
{errors.brandName}
</p>

</div>



{/* Brand Type */}

<div>

<label>
Brand Type *
</label>

<select
name="brandType"
value={
formData.brandType
}
onChange={handleChange}
className="w-full border p-3 rounded mt-2"
>

<option value="">
Select
</option>

<option>
Hair Care
</option>

<option>
Skin Care
</option>

<option>
Food
</option>

<option>
Beverage
</option>

</select>

<p className="text-red-500">
{errors.brandType}
</p>

</div>



{/* Manufacturer */}

<div>

<label>
Manufacturer *
</label>

<select
name="manufacturer"
value={
formData.manufacturer
}
onChange={handleChange}
className="w-full border p-3 rounded mt-2"
>

<option value="">
Select
</option>

<option>
HUL
</option>

<option>
P&G
</option>

<option>
Nestle
</option>

</select>

<p className="text-red-500">
{errors.manufacturer}
</p>

</div>



{/* Parent Brand */}

<div>

<label>
Parent Brand
</label>

<select
name="parentBrand"
value={
formData.parentBrand
}
onChange={handleChange}
className="w-full border p-3 rounded mt-2"
>

<option>
None
</option>

<option>
Clinic Plus
</option>

<option>
Dove
</option>

</select>

</div>



{/* Segment */}

<div>

<label>
Segment *
</label>

<select
name="segment"
value={
formData.segment
}
onChange={handleChange}
className="w-full border p-3 rounded mt-2"
>

<option value="">
Select
</option>

<option>
Personal Care
</option>

<option>
Health Care
</option>

<option>
Food
</option>

</select>

<p className="text-red-500">
{errors.segment}
</p>

</div>



{/* Country */}

<div>

<label>
Country *
</label>

<select
name="country"
value={
formData.country
}
onChange={handleChange}
className="w-full border p-3 rounded mt-2"
>

<option value="">
Select
</option>

<option>
India
</option>

<option>
USA
</option>

<option>
UK
</option>

</select>

<p className="text-red-500">
{errors.country}
</p>

</div>



{/* Description */}

<div>

<label>
Description
</label>

<textarea
name="description"
rows={4}
value={
formData.description
}
onChange={handleChange}
maxLength={500}
className="w-full border p-3 rounded mt-2"
/>

<div className="text-gray-400 text-sm">

{
formData.description
.length
}/500

</div>

<p className="text-red-500">

{errors.description}

</p>

</div>



{/* Logo */}

<div>

<label>
Logo Upload
</label>

<input
type="file"
accept="image/*"
onChange={handleFile}
className="mt-2"
/>

<p className="text-red-500">
{errors.logo}
</p>

</div>



{/* Success */}

{
success &&

<div className="bg-green-100 p-3 rounded text-green-700">

{success}

</div>

}



<button
disabled={loading}
className="
bg-blue-600
hover:bg-blue-700
text-white
px-8
py-3
rounded-lg
w-full
"
>

{
loading
? "Saving..."
: "Save Brand"
}

</button>

</form>

</div>
</div>
  );
};

export default AddBrand;