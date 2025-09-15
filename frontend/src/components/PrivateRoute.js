import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!user) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        // Logged in but no sufficient permissions, redirect to home or an unauthorized page
        return <Navigate to="/" />; // Or a specific unauthorized page
    }

    return children;
};

export default PrivateRoute;
