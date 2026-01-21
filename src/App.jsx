import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./UserDetail/Login";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";
import ActivateAccount from './UserDetail/ActivateAccount';

import Layout from "./Reusable/Layout";

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
      <Route path="/activate/:uid/:token" element={<ActivateAccount />} />

      {/* Main Pages with Unified Layout */}
      <Route element={<Layout />}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Feature Modules */}
        <Route path="/users" element={<UsersDashboard />} />
        <Route path="/equipment" element={<EquipmentDashboard />} />
        <Route path="/project" element={<ProjectDashboard />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/safety" element={<SafetyDashboard />} />
        <Route path="/production" element={<ProductionDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
