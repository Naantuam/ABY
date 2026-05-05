import React, { useState } from "react";
import api from "../api";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";

const SecuritySettings = () => {
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post("/auth/change-password/", {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setMessage({ type: "success", text: "✅ Password updated successfully!" });
      setForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">Security Settings</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="old_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.old_password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="new_password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.new_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="confirm_password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
