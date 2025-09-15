import React, { useEffect, useState } from 'react';
import '../App.css'; // Import App.css for general styles
import api from '../utils/api';
import './AdminUsers.css'; // Import AdminUsers.css for specific styles

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        address: '',
        role: '',
    });
    const [sort, setSort] = useState({
        by: 'name',
        order: 'ASC',
    });
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchUsers();
        }, 3000); // Debounce for 3 seconds (3000ms)

        return () => {
            clearTimeout(handler);
        };
    }, [filters, sort]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams(filters);
            queryParams.append('sort_by', sort.by);
            queryParams.append('order', sort.order);
            console.log('AdminUsers: Fetching users with URL:', `/admin/users?${queryParams.toString()}`);
            const res = await api.get(`/admin/users?${queryParams.toString()}`);
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users', err);
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSortChange = (byField) => {
        setSort(prevSort => ({
            by: byField,
            order: prevSort.by === byField && prevSort.order === 'ASC' ? 'DESC' : 'ASC',
        }));
    };

    const openUserDetailsModal = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setSelectedUserDetails(res.data);
            setShowUserDetailsModal(true);
        } catch (err) {
            console.error(`Error fetching user details for ID ${userId}:`, err);
            setError('Failed to load user details.');
        } finally {
            setLoading(false);
        }
    };

    const closeUserDetailsModal = () => {
        setShowUserDetailsModal(false);
        setSelectedUserDetails(null);
    };

    if (loading) return <div className="admin-users-container">Loading users...</div>;
    if (error) return <div className="admin-users-container alert alert-danger">Error: {error}</div>;

    return (
        <div className="admin-users-container">
            <h2 className="admin-page-title"><i className="fas fa-users"></i> Manage Users</h2>

            {/* Filters */}
            <div className="filter-bar-container">
                <input
                    type="text"
                    placeholder="Filter by Name"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Filter by Email"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Filter by Address"
                    name="address"
                    value={filters.address}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    className="filter-input"
                >
                    <option value="">All Roles</option>
                    <option value="Normal User">Normal User</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Store Owner">Store Owner</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="table-responsive">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSortChange('name')} className="sortable-header">Name {sort.by === 'name' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('email')} className="sortable-header">Email {sort.by === 'email' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('address')} className="sortable-header">Address {sort.by === 'address' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('role')} className="sortable-header">Role {sort.by === 'role' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.address}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => openUserDetailsModal(user.id)} className="view-details-btn">
                                        <i className="fas fa-eye"></i> View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {showUserDetailsModal && selectedUserDetails && (
                <div className="user-details-modal-overlay">
                    <div className="user-details-modal-container">
                        <h3 className="modal-title">User Details: {selectedUserDetails.name}</h3>
                        <p><strong>Email:</strong> {selectedUserDetails.email}</p>
                        <p><strong>Address:</strong> {selectedUserDetails.address}</p>
                        <p><strong>Role:</strong> {selectedUserDetails.role}</p>

                        {selectedUserDetails.role === 'Store Owner' && (
                            <p><strong>Overall Store Rating:</strong> {selectedUserDetails.overall_rating || 'N/A'}</p>
                        )}

                        <button onClick={closeUserDetailsModal} className="close-modal-btn">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
