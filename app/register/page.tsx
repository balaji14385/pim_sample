'use client'

import React, { useState } from "react";
import axios from "axios";
interface FormData {
  name: string;
  age: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  terms: boolean;
}

interface FormErrors {
  name?: string;
  age?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  terms?: string;
}

const RegistrationForm = () => {

  const [form, setForm] = useState<FormData>({
    name: "",
    age: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    terms: false,
  });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value
    }));

    // remove error while typing
    setErrors((prev)=>({
      ...prev,
      [name]:""
    }))
  };

  const validate = () => {

    const newErrors: FormErrors = {};

    // Name
    if (!form.name.trim()) {
      newErrors.name =
        "Name is required";
    }
    else if (form.name.length < 3) {
      newErrors.name =
        "Minimum 3 characters";
    }
    else if (
      !/^[A-Za-z ]+$/.test(form.name)
    ) {
      newErrors.name =
        "Only letters allowed";
    }

    // Age
    if (!form.age) {
      newErrors.age =
        "Age required";
    }
    else if (
      Number(form.age) < 18 ||
      Number(form.age) > 100
    ) {
      newErrors.age =
        "Age must be between 18-100";
    }

    // Phone
    if (!form.phone) {
      newErrors.phone =
        "Phone required";
    }
    else if (
      !/^[0-9]{10}$/.test(form.phone)
    ) {
      newErrors.phone =
        "Enter valid 10 digit number";
    }

    // Email
    if (!form.email) {
      newErrors.email =
        "Email required";
    }
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        form.email
      )
    ) {
      newErrors.email =
        "Invalid email";
    }

    // Password

    if (!form.password) {
      newErrors.password =
        "Password required";
    }
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      .test(form.password)
    ) {
      newErrors.password =
        "Min 8 chars, upper, lower, number & special char";
    }

    // Confirm password

    if (!form.confirmPassword) {
      newErrors.confirmPassword =
        "Confirm password required";
    }
    else if (
      form.password !==
      form.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    // Gender

    if (!form.gender) {
      newErrors.gender =
        "Select gender";
    }

    // Terms

    if (!form.terms) {
      newErrors.terms =
        "Accept terms & conditions";
    }

    setErrors(newErrors);

    return Object.keys(
      newErrors
    ).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (validate()) {
     console.log(form)
      try {

        const res =await axios.post('/api/register',form)
          
        const data =res.data

        console.log(data);

        alert(
          "Registration Successful"
        );

        setForm({
          name: "",
          age: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
          gender: "",
          terms: false,
        });

      }
      catch(error){
        console.log(error);
      }
    }
  };

  return (

    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >

        <h1 className="text-3xl font-bold text-center mb-6">
          Registration
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <p className="text-red-500 text-sm">
          {errors.name}
        </p>

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-3"
        />
        <p className="text-red-500 text-sm">
          {errors.age}
        </p>

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-3"
        />
        <p className="text-red-500 text-sm">
          {errors.phone}
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-3"
        />
        <p className="text-red-500 text-sm">
          {errors.email}
        </p>

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-3"
        >
          <option value="">
            Select Gender
          </option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>

          <option value="Other">
            Other
          </option>

        </select>

        <p className="text-red-500 text-sm">
          {errors.gender}
        </p>

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-3"
        />
        <p className="text-red-500 text-sm">
          {errors.password}
        </p>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-3"
        />
        <p className="text-red-500 text-sm">
          {errors.confirmPassword}
        </p>

        <div className="flex gap-2 mt-3">

          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
          />

          <label>
            Accept Terms & Conditions
          </label>

        </div>

        <p className="text-red-500 text-sm">
          {errors.terms}
        </p>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded mt-5"
        >
          Register
        </button>

      </form>

    </div>
  );
};

export default RegistrationForm;