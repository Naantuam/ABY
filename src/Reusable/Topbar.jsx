import React, { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { UserCircle, X, Camera, Eye, EyeOff } from 'lucide-react';
import api from "../api"

export default function TopBar({ sidebarOpen = true, setSidebarOpen = () => {} }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [passwordFields, setPasswordFields] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  // Find the full role object by matching the ID
  const roleObject = roles.find(r => r.id === editableUser?.role);
  const roleLabel = roleObject ? roleObject.label : (editableUser?.role || "Unknown Role");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch current user data and all roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both user and roles in parallel
        const [userResponse, rolesResponse] = await Promise.all([
          api.get('/api/users/me/'),
          api.get('/api/users/roles/') // <-- ADD THIS FETCH
        ]);

        // Set user data
        setCurrentUser(userResponse.data);
        setEditableUser(userResponse.data);

        // Set roles data (handles paginated or simple array)
        const rolesData = rolesResponse.data;
        const rolesList = Array.isArray(rolesData) ? rolesData : rolesData.results || [];
        setRoles(rolesList); // <-- SAVE THE ROLES

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load user profile or roles.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // This empty array means it only runs once on mount

  const handleOpenProfileModal = () => {
    if (currentUser) {
      setEditableUser(currentUser); 
    }
    setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setSuccessMessage('');
    setShowPasswordForm(false);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => setShowProfileModal(false);
  const handleProfileChange = (e) => setEditableUser({ ...editableUser, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordFields({ ...passwordFields, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const response = await api.put(`/users/${currentUser.id}/update/`, editableUser);
      setCurrentUser(response.data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    console.log("Password change logic needs a dedicated API endpoint.");
    setError("Password change functionality is not yet connected to the backend.");
  };
  return (
    <>
      <header className="w-full bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Left section (Bars button) */}
        <div className="flex items-center">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md bg-transparent text-black"
            >
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>

        {/* Right section (Icons) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notification Bell */}
          <button className="relative text-gray-600 hover:text-black">
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
            <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* User Icon */}
          <button onClick={handleOpenProfileModal} className="text-gray-600 hover:text-blue-600 transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <UserCircle className="h-7 w-7" />
          </button>
        </div>
      </header>

               
      {/* ===== User Profile Modal ===== */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60 p-4">
            {loading && <p className="text-white">Loading profile...</p>}
            {error && !loading && <p className="text-red-500 bg-white p-4 rounded-lg">{error}</p>}
            {editableUser && !loading && (
                 <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                        <button onClick={handleCloseProfileModal} className="text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column: Picture & Actions */}
                        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-48">
                            <div className="relative w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center mb-4 border-2 border-slate-200">
                                {editableUser.picture ? (
                                    <img src={editableUser.picture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <UserCircle className="w-24 h-24 text-slate-300" />
                                )}
                                <label htmlFor="profile-pic-upload" className="cursor-pointer absolute bottom-1 right-1 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md">
                                    <Camera className="w-5 h-5 text-gray-600" />
                                    <input id="profile-pic-upload" type="file" className="hidden" />
                                </label>
                            </div>
                            <p className="font-semibold text-lg text-gray-800">{editableUser.name}</p>
                            <p className="text-sm text-gray-500">{roleLabel}</p>
                        </div>
                        
                        {/* Right Column: Details & Forms */}
                        <div className="flex-grow">
                            <form onSubmit={handleProfileSave}>
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Personal Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                        <input type="email" name="email" value={editableUser.email || ''} onChange={handleProfileChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                        <input type="text" name="phone" value={editableUser.phone || ''} onChange={handleProfileChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                                        <input type="text" name="department" value={editableUser.department || ''} onChange={handleProfileChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                        <input type="text" name="role" readOnly value={roleLabel} onChange={handleProfileChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                               <div className="mt-2">
                                {!showPasswordForm ? (
                                    <button
                                        type="button"
                                        onClick={() => { setShowPasswordForm(true); setError(''); setSuccessMessage(''); }}
                                        className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Change Password
                                    </button>
                                ) : (
                                    <form onSubmit={handlePasswordSave}>
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                                                <input type={showCurrentPass ? "text" : "password"} name="currentPassword" value={passwordFields.currentPassword} onChange={handlePasswordChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                                                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                                                <input type={showNewPass ? "text" : "password"} name="newPassword" value={passwordFields.newPassword} onChange={handlePasswordChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                                                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                                                <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" value={passwordFields.confirmPassword} onChange={handlePasswordChange} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                                                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                                        {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}
                                        <div className="flex items-center gap-3 mt-4">
                                            <button type="submit" className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                                Update Password
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordForm(false)}
                                                className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                            </form>

                            <div className="mt-4">
                               <button onClick={handleProfileSave} className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                  Save Changes
                               </button>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </div>
      )}
    </>
  );
}