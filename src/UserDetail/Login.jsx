import React, { useState } from "react";
import api from "../api"
import AuthLayout from "./AuthComponents/AuthLayout"
import AuthCard from "./AuthComponents/AuthCard"
import AuthLink from "./AuthComponents/AuthLink"
import AuthButton from "./AuthComponents/AuthButton"
import Logo from "./AuthComponents/Logo"
import InputField from "./AuthComponents/InputField";
import { Mail, Lock } from "lucide-react"; 

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login/", {
        email: form.email,
        password: form.password,
      });

      console.log("✅ Login success:", response.data);

      // Optional: store token if backend returns one
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Redirect to Admin dashboard
      window.location.href = "/Admin";
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      alert("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <Logo />
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <InputField id="email" label="Email" type="email" placeholder="Enter your email"
            value={form.email} onChange={handleChange} Icon={Mail} />
          <InputField id="password" label="Password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange} Icon={Lock} />
          <AuthButton
            type="submit"
            label={loading ? "Logging in..." : "Login"}
          />
        </form>
        <div className="flex justify-between items-center mt-4">
          <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
