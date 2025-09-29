import React from "react";
import UsersCard from "./UsersCard";
import UserPanel from "./UserPanel"


export default function UsersDashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <UsersCard />
                </div>
                <div className="w-full mb-3">
                    <UserPanel />
                </div>
            </div>
        </>
    );
}