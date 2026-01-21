import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthLink from "./AuthComponents/AuthLink";
import AuthButton from "./AuthComponents/AuthButton";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import { Mail, Lock } from "lucide-react";
import api from "../api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔄 FIX: Removed "/api" prefix because api.js handles it now
      const res = await api.post("/users/token/", form);
      const { access, user, refresh } = res.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("refresh_token", refresh);

      window.location.href = "/Admin";
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed due to an unknown error.";

      console.error("Login failed:", errorMessage);

      if (!err.response) {
        alert("Could not connect to the server. Check your internet connection or server status.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>

        {/* Top Section: Logo & Title */}
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
          {/* Mobile-only heading */}
          <h1 className="md:hidden text-white text-xl font-bold text-center mt-6">
            Sign in to ABY Diamond Mines
          </h1>
        </div>

        {/* Middle Section: Form (Grows to fill space) */}
        <div className="flex-grow flex flex-col justify-center py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              Icon={Mail}
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              Icon={Lock}
            />

            {/* Added margin top to separate button slightly */}
            <div className="mt-4">
              <AuthButton
                type="submit"
                label="Login"
                isLoading={loading}
              />
            </div>
          </form>
        </div>

        {/* Bottom Section: Links */}
        <div className="flex justify-center items-center pb-4 md:pb-0">
          <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
        </div>

      </AuthCard>
    </AuthLayout>
  );
};

export default Login;