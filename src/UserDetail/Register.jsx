import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import AuthButton from "./AuthComponents/AuthButton";
import AuthLink from "./AuthComponents/AuthLink";

const Register = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  
  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // 🔌 Call POST /api/auth/register (Admin use only)
  };

  return (
    <AuthLayout>
      <AuthCard>
        <Logo />
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
          <InputField id="fullName" label="Full Name" placeholder="John Doe"
            value={form.fullName} onChange={handleChange} />
          <InputField id="email" label="Email" type="email" placeholder="admin@example.com"
            value={form.email} onChange={handleChange} />
          <InputField id="password" label="Password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} />
          <InputField id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••"
            value={form.confirmPassword} onChange={handleChange} />
          <AuthButton type="submit" label="Register" />
        </form>
        <div className="flex justify-center mt-4">
          <AuthLink to="/login">Back to Login</AuthLink>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
