// src/utils/notAuthorize.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const NotAuthorize = () => {
  const token = localStorage.getItem("token"); 

  // If a token exists, the user is authorized. We redirect them away from auth pages.
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // If there's no token, the user is not authorized, so we allow them to access the nested routes.
  return <Outlet />;
};

export default NotAuthorize;