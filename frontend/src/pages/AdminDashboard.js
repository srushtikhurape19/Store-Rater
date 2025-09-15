import React, { useEffect, useState } from 'react';
import '../App.css'; // Import App.css for general styles
import './AdminDashboard.css'; // Import AdminDashboard.css for specific styles
import api from '../utils/api';

const AdminDashboard = () => {
    const [counts, setCounts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await api.get('/admin/dashboard-counts');
                setCounts(res.data);
            } catch (err) {
                console.error('Error fetching dashboard counts', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    if (loading) return <div className="admin-dashboard-container">Loading dashboard...</div>;
    if (error) return <div className="admin-dashboard-container alert alert-danger">Error: {error}</div>;

    return (
        <div className="admin-dashboard-container">
            <h2 className="admin-dashboard-title">Welcome, Administrator!</h2>
            <p className="dashboard-intro">Here's a quick overview of your system.</p>

            <div className="dashboard-metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-users"></i></div>
                    <h3 className="metric-title">Total Users</h3>
                    <p className="metric-value">{counts.totalUsers}</p>
                </div>
                <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-store"></i></div>
                    <h3 className="metric-title">Total Stores</h3>
                    <p className="metric-value">{counts.totalStores}</p>
                </div>
                <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-star"></i></div>
                    <h3 className="metric-title">Total Ratings</h3>
                    <p className="metric-value">{counts.totalRatings}</p>
                </div>
            </div>

            <div className="admin-actions-section">
                <h3 className="actions-title">Quick Actions</h3>
                <div className="action-buttons-container">
                    <a href="/admin/users" className="action-button primary">Manage Users</a>
                    <a href="/admin/stores" className="action-button primary">Manage Stores</a>
                    {/* These links could eventually open modals for adding, similar to StoreList */}
                    <a href="#" className="action-button secondary">Add New User</a>
                    <a href="#" className="action-button secondary">Add New Store</a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

