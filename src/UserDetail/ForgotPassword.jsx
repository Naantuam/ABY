import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import AuthButton from "./AuthComponents/AuthButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 🔌 Call POST /api/auth/password/forgot
  };

  return (
    <AuthLayout>
      <AuthCard>
        <Logo />
        <h2 className="text-xl font-semibold text-center mt-4">Forgot Password?</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email to reset your password
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
          <InputField id="email" label="Email" type="email" placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <AuthButton type="submit" label="Send Reset Link" />
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
