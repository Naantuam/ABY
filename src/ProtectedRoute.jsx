// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ element, allowedRole }) {
//   // Example: user stored in localStorage after login
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!user) {
//     return <Navigate to="/" replace />; // not logged in → back to login
//   }

//   if (allowedRole && user.role !== allowedRole) {
//     return <Navigate to="/unauthorized" replace />; // wrong role
//   }

//   return element;
// }
