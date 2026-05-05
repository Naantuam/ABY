import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./UserDetail/Login";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";
import ResetPassword from "./UserDetail/ResetPassword";
import ActivateAccount from './UserDetail/ActivateAccount';
import SecuritySettings from "./UserDetail/SecuritySettings";
import Unauthorized from "./Pages/Auth/Unauthorized";

import Layout from "./Reusable/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "./Pages/AdminDashboard/Dashboard";
import UsersDashboard from "./UserDetail/UserManagement/UsersDashboard";
import EquipmentDashboard from "./Pages/Equipment/EquipmentDashboard";
import ProjectDashboard from "./Pages/Project/ProjectDashboard";
import InventoryDashboard from "./Pages/Inventory/InventoryDashboard";
import SafetyDashboard from "./Pages/Safety/SafetyDashboard";
import ProductionDashboard from "./Pages/Production/ProductionDashboard";

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<Login />} />
      <Route path="/mfa" element={<MFA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Main Pages with Unified Layout */}
      <Route element={<Layout />}>
        {/* Dashboard - "admin_only" for base access */}
        <Route path="/dashboard" element={<ProtectedRoute app="dashboard"><Dashboard /></ProtectedRoute>} />

        {/* Feature Modules */}
        <Route path="/users" element={<ProtectedRoute app="users"><UsersDashboard /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute app="equipment"><EquipmentDashboard /></ProtectedRoute>} />
        <Route path="/project" element={<ProtectedRoute app="projects"><ProjectDashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute app="inventory"><InventoryDashboard /></ProtectedRoute>} />
        <Route path="/safety" element={<ProtectedRoute app="safety"><SafetyDashboard /></ProtectedRoute>} />
        <Route path="/production" element={<ProtectedRoute app="production"><ProductionDashboard /></ProtectedRoute>} />
        <Route path="/security" element={<SecuritySettings />} />
      </Route>
    </Routes>
  );
}

export default App;
