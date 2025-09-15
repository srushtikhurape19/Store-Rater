import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Import App.css for general styles
import './Register.css'; // Import Register.css for specific register page styles
import api from '../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const { name, email, address, password, confirmPassword } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const res = await api.post('/auth/register', { name, email, address, password });
            console.log('Backend response on successful registration:', res.data);
            setMessage(res.data.msg || 'Registration successful!');
            // Add a small delay before navigating to allow message to display
            setTimeout(() => {
                navigate('/login');
            }, 1500); // 1.5 second delay
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.msg || err.message || 'Registration failed');
        }
    };

    return (
        <div className="register-page-wrapper">
            <div className="register-container">
                <h2 className="register-heading"><i className="fas fa-user-plus register-icon"></i> Register</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Name (20-60 chars)"
                            name="name"
                            value={name}
                            onChange={onChange}
                            required
                            minLength="20"
                            maxLength="60"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Address (max 400 chars)"
                            name="address"
                            value={address}
                            onChange={onChange}
                            required
                            maxLength="400"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password (8-16 chars, 1 Upper, 1 Special)"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            minLength="8"
                            maxLength="16"
                            pattern="(?=.*[A-Z])(?=.*[!@#$%^&*_\])(?=.{8,16}$)"
                            title="Password must be 8-16 characters long, include at least one uppercase letter and one special character"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Register
                    </button>
                </form>
                {message && <p className={message.includes('successful') ? 'alert alert-success' : 'alert alert-danger'}>{message}</p>}
            </div>
        </div>
    );
};

export default Register;
