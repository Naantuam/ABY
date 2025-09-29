import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./UserDetail/Login";
import Register from "./UserDetail/Register";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";

import AdminLayout from "./Pages/AdminDashboard/AdminLayout";
import Dashboard from "./Pages/AdminDashboard/Dashboard";
import UsersDashboard from "./UserDetail/UserManagement/UsersDashboard";

import EquipmentLayout from "./Pages/Equipment/EquipmentLayout";
import EquipmentDashboard from "./Pages/Equipment/EquipmentDashboard";

import ProjectLayout from"./Pages/Project/ProjectLayout";
import ProjectDashboard from "./Pages/Project/ProjectDashboard";

import InventoryLayout from "./Pages/Inventory/InventoryLayout";
import InventoryDashboard from "./Pages/Inventory/InventoryDashboard";

import SafetyLayout from "./Pages/Safety/SafetyLayout";
import SafetyDashboard from "./Pages/Safety/SafetyDashboard";

import ProductionLayout from "./Pages/Production/ProductionLayout";
import ProductionDashboard from "./Pages/Production/ProductionDashboard";

// import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mfa" element={<MFA />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} /> {/* /admin */}
          <Route path="users" element={<UsersDashboard />} /> {/* /admin/users */}
          <Route path="equipment" element={<EquipmentDashboard />} /> {/* /admin/equipment */}
          <Route path="project" element={<ProjectDashboard />} /> {/* /admin/project */}
          <Route path="inventory" element={<InventoryDashboard />} /> {/* /admin/inventory */}
          <Route path="safety" element={<SafetyDashboard />} /> {/* /admin/safety */}
          <Route path="production" element={<ProductionDashboard />} /> {/* /admin/production */}
          {/* you can add more admin-only routes here */}
        </Route>

        {/* Equipment Panel */}
        <Route path="/equipment" element={<EquipmentLayout />}>
          <Route index element={<EquipmentDashboard />} /> {/* /equipment */}
          {/* you can add more equipment-only routes here */}
        </Route>

        {/* Operations Panel */}
        <Route path="/project" element={<ProjectLayout />}>
          <Route index element={<ProjectDashboard />} /> {/* /project */}
          {/* you can add more project-only routes here */}
        </Route>
        {/* Inventory Panel */}
        <Route path="/inventory" element={<InventoryLayout />}>
          <Route index element={<InventoryDashboard />} /> {/* /inventory */}
          {/* you can add more inventory-only routes here */}
        </Route> 
        {/* Safety Panel */}
        <Route path="/safety" element={<SafetyLayout />}>
          <Route index element={<SafetyDashboard />} /> {/* /Safety */}
          {/* you can add more safety-only routes here */}
        </Route>   
        <Route path="/production" element={<ProductionLayout />}>
          <Route index element={<ProductionDashboard />} /> {/* /production */}
          {/* you can add more production-only routes here */}
        </Route>   
        {/* Add more main routes as needed */}
      </Routes>
  );
}

export default App;
