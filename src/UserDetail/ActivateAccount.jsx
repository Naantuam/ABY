import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // Your Axios instance

export default function ActivateAccount() {
  const { uid, token } = useParams(); // Grab params from URL
  const navigate = useNavigate();
  const [status, setStatus] = useState("Activating...");

  useEffect(() => {
    const activateUser = async () => {
      try {
        // Post to the backend activation endpoint
        await api.post("/auth/users/activation/", { uid, token });
        setStatus("✅ Account activated! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error(error);
        setStatus("❌ Activation failed. The link may be expired.");
      }
    };

    if (uid && token) {
      activateUser();
    }
  }, [uid, token, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Account Activation</h2>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
}