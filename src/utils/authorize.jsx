import { Outlet, Navigate } from 'react-router-dom';

export default function Authorize() {
    const token = localStorage.getItem("token");

    // If there is NO token, redirect to the login page
    return token == null ? <Navigate to="/auth/login" replace /> : <Outlet />;
}