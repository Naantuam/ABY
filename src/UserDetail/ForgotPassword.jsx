import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import AuthButton from "./AuthComponents/AuthButton";
import AuthLink from "./AuthComponents/AuthLink"; // Make sure to import this!
import { Mail } from "lucide-react"; // Optional: Add icon for consistency

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 🔌 Call POST /api/auth/password/forgot
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Top Section */}
        <div className="flex flex-col items-center mt-4 md:mt-0">
          <Logo />
          <h2 className="text-xl font-bold text-white text-center mt-6">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-300 text-center mt-2">
            Enter your email to reset your password
          </p>
        </div>

        {/* Middle Section (Form) */}
        <div className="flex-grow flex flex-col justify-center py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <InputField 
              id="email" 
              label="Email" 
              type="email" 
              placeholder="Enter your email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              Icon={Mail} 
            />
            
            <div className="mt-2">
              <AuthButton type="submit" label="Send Reset Link" />
            </div>
          </form>
        </div>

        {/* Bottom Section: Back to Login */}
        <div className="flex justify-center items-center pb-4 md:pb-0">
           <AuthLink to="/">Back to Login</AuthLink>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;