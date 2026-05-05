import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import Logo from "./AuthComponents/Logo";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    setMessage("");
    try {
      await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, { password: form.password });
      setSuccess(true);
      setMessage("✅ Password has been reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.detail || "Failed to reset password. The link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
          <Logo />
          <h1 className="text-white text-xl font-bold text-center mt-6 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-300 text-sm text-center mb-6">
            Enter a new password for your account.
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-center py-6">
          {message && (
            <p className={`text-sm text-center mb-6 ${success ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <InputField
                id="password"
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={form.password}
                onChange={handleChange}
                Icon={Lock}
              />

              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                Icon={Lock}
              />

              <div className="mt-4">
                <AuthButton
                  type="submit"
                  label="Reset Password"
                  isLoading={loading}
                />
              </div>
            </form>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
