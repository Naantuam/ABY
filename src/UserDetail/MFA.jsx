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
        <Logo />
        <h2 className="text-xl font-semibold text-center mt-4">Multi-Factor Authentication</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Please select your authentication method
        </p>
        <MfaSelector onSelect={setMethod} />
        <form onSubmit={handleVerify} className="flex flex-col gap-6 mt-6">
          <InputField id="code" label="Verification Code" placeholder="Enter 6-digit code"
            value={code} onChange={(e) => setCode(e.target.value)} />
          <AuthButton type="submit" label="Verify" disabled={!method || !code} />
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Mfa;
