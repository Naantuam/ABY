import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import api from "../api";

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [appPermissions, setAppPermissions] = useState({});
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const fetchAuthData = async () => {
            setLoadingAuth(true);
            try {
                const apps = ['users', 'projects', 'equipment', 'inventory', 'safety', 'production'];
                const [userRes, rolesRes, ...permsResList] = await Promise.all([
                    api.get("/users/me/"),
                    api.get("/users/roles/"),
                    ...apps.map(app => api.get(`/users/permissions/${app}/`).catch(() => ({ data: [] })))
                ]);

                setUser(userRes.data);
                
                const rolesData = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data.results || []);
                setRoles(rolesData.map(r => {
                    const rawPerms1 = r.role_permissions || [];
                    const rawPerms2 = r.rolemodulepermissions || [];
                    const rawPerms3 = r.rolemodulepermission_set || [];
                    const rawPerms4 = r.role_module_permissions || [];
                    const rawPerms5 = r.module_permissions || [];
                    const rawPerms6 = r.permissions || [];
                    const combined = [...rawPerms1, ...rawPerms2, ...rawPerms3, ...rawPerms4, ...rawPerms5, ...rawPerms6];
                    const parsedPermIds = Array.from(new Set(combined.map(p => {
                        let val = typeof p === 'object' && p !== null ? (p.access_level || p.permission || p.permission_id || p.id) : p;
                        return Number(val);
                    }).filter(id => !isNaN(id) && id !== 0 && id !== null)));
                    return { ...r, id: r.id ?? r.key, permissions: parsedPermIds };
                }));

                const newAppPermissions = {};
                apps.forEach((app, index) => {
                    const data = permsResList[index]?.data;
                    newAppPermissions[app] = Array.isArray(data) ? data : (data?.results || []);
                });
                setAppPermissions(newAppPermissions);

            } catch (err) {
                console.error("Failed to fetch auth data:", err);
            } finally {
                setLoadingAuth(false);
            }
        };

        fetchAuthData();
    }, []);

    return (
        <div className="h-screen font-mono flex flex-col relative">
            {/* Fixed TopBar */}
            <TopBar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                user={user} 
                roles={roles} 
                loadingAuth={loadingAuth} 
            />

            {/* Main Layout Container */}
            <div className="flex flex-1 overflow-hidden transition-all duration-300 ease-in-out relative">

                {/* MOBILE OVERLAY (Backdrop)
            - Visible only on mobile (md:hidden)
            - Visible only when sidebar is OPEN
            - Click to close sidebar
        */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar 
            - We wrap it in a div to ensure it sits above the backdrop (z-30) 
            - On desktop, z-index resets (md:z-auto) 
        */}
                <div className="">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        user={user}
                        roles={roles}
                        appPermissions={appPermissions}
                    />
                </div>

                {/* Main Content 
            - Removed direct 'ml-55' on mobile.
            - Added 'md:ml-55': This ensures the "push" only happens on Desktop.
            - On Mobile, it stays 'ml-0' so the content remains full width behind the sidebar.
        */}
                <main
                    className={`flex-1 transition-all duration-300 ease-in-out overflow-x-auto ${sidebarOpen ? "md:ml-55" : "ml-0"
                        }`}
                >
                    <Outlet context={{ user, roles, appPermissions, loadingAuth }} />
                </main>
            </div>
        </div>
    );
}
