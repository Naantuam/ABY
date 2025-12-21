import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import Logo from "./AuthComponents/Logo";
import InputField from "./AuthComponents/InputField";
import AuthButton from "./AuthComponents/AuthButton";
import MfaSelector from "./AuthComponents/MfaSelector";

const Mfa = () => {
  const [method, setMethod] = useState(null);
  const [code, setCode] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();
    // 🔌 Call POST /api/auth/mfa/verify-code
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Top Section */}
        <div className="flex flex-col items-center mt-4 md:mt-0">
          <Logo />
          <h2 className="text-xl font-bold text-white text-center mt-6">
            Multi-Factor Authentication
          </h2>
          <p className="text-sm text-gray-300 text-center mt-2 mb-2">
            Please select your authentication method
          </p>
        </div>

        {/* Middle Section (Grows to fill space) */}
        <div className="flex-grow flex flex-col justify-center py-6 gap-6">
          <MfaSelector onSelect={setMethod} />
          
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <InputField 
              id="code" 
              label="Verification Code" 
              placeholder="Enter 6-digit code"
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
            />
            
            <div className="mt-2">
              <AuthButton 
                type="submit" 
                label="Verify" 
                disabled={!method || !code} 
              />
            </div>
          </form>
        </div>
        
        {/* Bottom Spacer (Keep layout balanced) */}
        <div className="h-4"></div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Mfa;