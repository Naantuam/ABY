import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <ShieldExclamationIcon className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 max-w-md mb-8">
                You do not have the required permissions to view this page or perform this action. 
                If you believe this is a mistake, please contact your administrator.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mr-3"
            >
                Go Back
            </button>
            <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
                Home
            </button>
        </div>
    );
}
