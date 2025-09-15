import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/user');
                    setUser(res.data);
                } catch (err) {
                    console.error('Error loading user', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        // This login function will no longer be used directly for login as Login.js handles the API call
        // Instead, AuthContext will primarily manage the token state.
        console.log('AuthContext login function called (should not be used for direct login now).');
    };

    const register = async (name, email, address, password) => {
        try {
            const res = await api.post('/auth/register', { name, email, address, password });
            return res.data;
        } catch (err) {
            console.error('Registration failed', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updatePassword = async (oldPassword, newPassword) => {
        try {
            await api.put('/auth/update-password', { oldPassword, newPassword });
            return { msg: 'Password updated successfully' };
        } catch (err) {
            console.error('Password update failed', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, token, setToken, login, register, logout, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
