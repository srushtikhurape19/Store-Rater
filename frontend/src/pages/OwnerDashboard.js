import React, { useEffect, useState } from 'react';
import '../App.css';
import api from '../utils/api';

const OwnerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/owner/dashboard');
                setDashboardData(res.data);
            } catch (err) {
                console.error('Error fetching owner dashboard data:', err);
                setError(err.response?.data?.msg || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="owner-dashboard-container">Loading dashboard...</div>;
    if (error) return <div className="owner-dashboard-container alert alert-danger">Error: {error}</div>;
    if (!dashboardData) return <div className="owner-dashboard-container">No dashboard data available.</div>;

    const { store, average_rating, user_ratings } = dashboardData;

    return (
        <div className="owner-dashboard-container">
            <h2 className="owner-dashboard-title">Owner Dashboard</h2>
            <p className="dashboard-intro">Here's an overview of your store's performance and customer feedback.</p>

            <div className="dashboard-metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-store-alt"></i></div>
                    <h3 className="metric-title">Your Store</h3>
                    <p className="metric-value">{store.name}</p>
                    <p className="metric-sub-value">{store.email}</p>
                </div>
                <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-star"></i></div>
                    <h3 className="metric-title">Average Rating</h3>
                    <p className="metric-value">{average_rating}</p>
                </div>
                <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-users-slash"></i></div>
                    <h3 className="metric-title">Total Raters</h3>
                    <p className="metric-value">{user_ratings.length}</p>
                </div>
            </div>

            <div className="user-ratings-section">
                <h3 className="ratings-section-title">Customer Ratings for {store.name}</h3>
                {user_ratings && user_ratings.length > 0 ? (
                    <div className="ratings-list-grid">
                        {user_ratings.map((rating, index) => (
                            <div key={index} className="user-rating-card">
                                <p><strong>User:</strong> {rating.user_name} ({rating.user_email})</p>
                                <p><strong>Rating:</strong> {rating.rating}/5</p>
                                <p><strong>Rated On:</strong> {new Date(rating.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-ratings-message">No ratings submitted for your store yet.</p>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
