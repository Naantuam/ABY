import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout"
import AuthCard from "./AuthComponents/AuthCard"
import AuthLink from "./AuthComponents/AuthLink"
import AuthButton from "./AuthComponents/AuthButton"
import Logo from "./AuthComponents/Logo"
import InputField from "./AuthComponents/InputField";
import { Mail, Lock } from "lucide-react"; 
import api from "../api"

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔌 API call to Render backend
      const res = await api.post("/api/auth/login/", form);
      const { access, user, refresh } = res.data;

      // 💾 Save token for future protected routes
      localStorage.setItem("access_token", access);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("refresh_token", refresh);

      // 🚀 Redirect after success
      window.location.href = "/Admin";
    } catch (err) {
     // ... inside the catch(err) block
      const errorMessage = err.response?.data?.message // Get specific message from server
                            || err.message // Fallback to network error message (e.g., "Network Error")
                            || "Login failed due to an unknown error.";

      console.error("Login failed:", errorMessage);

      // Use a more user-friendly message for generic network/CORS issues
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
        <Logo />
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <InputField id="email" label="Email" type="email" placeholder="Enter your email"
            value={form.email} onChange={handleChange} Icon={Mail} />
          <InputField id="password" label="Password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange} Icon={Lock} />
          <AuthButton
            type="submit"
            label={loading ? "Logging in..." : "Login"}
            disabled={loading}
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
