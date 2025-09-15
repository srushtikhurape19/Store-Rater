import { useEffect, useState } from 'react';
import '../App.css'; // Import App.css for general styles
import api from '../utils/api';
import './AdminStores.css'; // Import AdminStores.css for specific styles

const AdminStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        address: '',
    });
    const [sort, setSort] = useState({
        by: 'name',
        order: 'ASC',
    });
    const [showAddStoreForm, setShowAddStoreForm] = useState(false);
    const [newStoreData, setNewStoreData] = useState({
        name: '',
        email: '',
        address: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerAddress: '',
    });
    const [addStoreMessage, setAddStoreMessage] = useState(null);
    const [showStoreDetailsModal, setShowStoreDetailsModal] = useState(false);
    const [selectedStoreDetails, setSelectedStoreDetails] = useState(null); // To store details of the selected store

    useEffect(() => {
        const handler = setTimeout(() => {
        fetchStores();
        }, 3000); // Debounce for 3 seconds (3000ms)

        return () => {
            clearTimeout(handler);
        };
    }, [filters, sort]);

    const fetchStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams(filters);
            queryParams.append('sort_by', sort.by);
            queryParams.append('order', sort.order);
            console.log('AdminStores: Fetching stores with URL:', `/admin/stores?${queryParams.toString()}`);
            const res = await api.get(`/admin/stores?${queryParams.toString()}`);
            setStores(res.data);
        } catch (err) {
            console.error('Error fetching stores', err);
            setError('Failed to load stores.');
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

    const handleNewStoreChange = (e) => {
        setNewStoreData({
            ...newStoreData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitAddStore = async (e) => {
        e.preventDefault();
        setAddStoreMessage(null);

        // Frontend validation for new owner password
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*_\]])(?=.{8,16}$)/;
        if (!passwordRegex.test(newStoreData.ownerPassword)) {
            setAddStoreMessage({ type: 'error', msg: 'Owner password must be 8-16 characters long, include at least one uppercase letter and one special character.' });
            return;
        }

        try {
            await api.post('/admin/stores', newStoreData);
            setAddStoreMessage({ type: 'success', msg: 'Store and Owner added successfully!' });
            setNewStoreData({ // Clear form and new owner data
                name: '',
                email: '',
                address: '',
                ownerName: '',
                ownerEmail: '',
                ownerPassword: '',
                ownerAddress: '',
            }); 
            fetchStores(); // Refresh the list of stores
            setShowAddStoreForm(false); // Hide form after submission
        } catch (err) {
            console.error('Error adding store and owner', err);
            setAddStoreMessage({ type: 'error', msg: err.response?.data?.msg || 'Failed to add store and owner.' });
        }
    };

    const openStoreDetailsModal = async (storeId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/admin/stores/${storeId}`);
            setSelectedStoreDetails(res.data);
            setShowStoreDetailsModal(true);
        } catch (err) {
            console.error(`Error fetching store details for ID ${storeId}:`, err);
            setError('Failed to load store details.');
        } finally {
            setLoading(false);
        }
    };

    const closeStoreDetailsModal = () => {
        setShowStoreDetailsModal(false);
        setSelectedStoreDetails(null);
    };

    if (loading) return <div className="admin-stores-container">Loading stores...</div>;
    if (error) return <div className="admin-stores-container alert alert-danger">Error: {error}</div>;

    return (
        <div className="admin-stores-container">
            <h2 className="admin-page-title"><i className="fas fa-store"></i> Manage Stores</h2>

            {/* Add Store Button */}
            <button onClick={() => setShowAddStoreForm(!showAddStoreForm)} className="add-store-toggle-btn">
                {showAddStoreForm ? 'Cancel Add Store' : 'Add Store'}
            </button>

            {addStoreMessage && (
                <div className={`form-submission-message ${addStoreMessage.type === 'success' ? 'success' : 'error'}`}>
                    {addStoreMessage.msg}
                </div>
            )}

            {/* Add New Store Form */}
            {showAddStoreForm && (
                <div className="add-store-form-card">
                    <h3 className="form-section-title">Add New Store and Owner</h3>
                    <form onSubmit={handleSubmitAddStore} className="store-owner-form">
                        <div className="form-section">
                            <h4><i className="fas fa-info-circle"></i> Store Details</h4>
                            <div className="form-group">
                                <label htmlFor="storeName">Store Name:</label>
                                <input
                                    id="storeName"
                                    type="text"
                                    placeholder="e.g., The Cozy Bookstore (20-60 chars)"
                                    name="name"
                                    value={newStoreData.name}
                                    onChange={handleNewStoreChange}
                                    required
                                    minLength="20"
                                    maxLength="60"
                                    className="form-control-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="storeEmail">Store Email:</label>
                                <input
                                    id="storeEmail"
                                    type="email"
                                    placeholder="e.g., contact@cozystore.com"
                                    name="email"
                                    value={newStoreData.email}
                                    onChange={handleNewStoreChange}
                                    required
                                    className="form-control-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="storeAddress">Store Address:</label>
                                <input
                                    id="storeAddress"
                                    type="text"
                                    placeholder="e.g., 123 Main St, Anytown (max 400 chars)"
                                    name="address"
                                    value={newStoreData.address}
                                    onChange={handleNewStoreChange}
                                    required
                                    maxLength="400"
                                    className="form-control-input"
                                />
                            </div>
                        </div>

                        <div className="form-section mt-4">
                            <h4><i className="fas fa-user-tie"></i> New Store Owner Details</h4>
                            <div className="form-group">
                                <label htmlFor="ownerName">Owner Name:</label>
                                <input
                                    id="ownerName"
                                    type="text"
                                    placeholder="e.g., John Smith (20-60 chars)"
                                    name="ownerName"
                                    value={newStoreData.ownerName}
                                    onChange={handleNewStoreChange}
                                    required
                                    minLength="20"
                                    maxLength="60"
                                    className="form-control-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ownerEmail">Owner Email:</label>
                                <input
                                    id="ownerEmail"
                                    type="email"
                                    placeholder="e.g., owner@example.com"
                                    name="ownerEmail"
                                    value={newStoreData.ownerEmail}
                                    onChange={handleNewStoreChange}
                                    required
                                    className="form-control-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ownerAddress">Owner Address:</label>
                                <input
                                    id="ownerAddress"
                                    type="text"
                                    placeholder="e.g., 456 Owner Rd, City (max 400 chars)"
                                    name="ownerAddress"
                                    value={newStoreData.ownerAddress}
                                    onChange={handleNewStoreChange}
                                    required
                                    maxLength="400"
                                    className="form-control-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ownerPassword">Owner Password:</label>
                                <input
                                    id="ownerPassword"
                                    type="password"
                                    placeholder="8-16 chars, 1 Upper, 1 Special"
                                    name="ownerPassword"
                                    value={newStoreData.ownerPassword}
                                    onChange={handleNewStoreChange}
                                    required
                                    minLength="8"
                                    maxLength="16"
                                    className="form-control-input"
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-add-store-btn">
                            Add Store
                        </button>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="filter-bar-container mt-4">
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
            </div>

            {/* Stores Table */}
            <div className="table-responsive">
                <table className="stores-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSortChange('name')} className="sortable-header">Store Name {sort.by === 'name' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('email')} className="sortable-header">Email {sort.by === 'email' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('address')} className="sortable-header">Address {sort.by === 'address' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('overall_rating')} className="sortable-header">Rating {sort.by === 'overall_rating' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store) => (
                            <tr key={store.id}>
                                <td>{store.name}</td>
                                <td>{store.email}</td>
                                <td>{store.address}</td>
                                <td>{store.overall_rating ? parseFloat(store.overall_rating).toFixed(2) : 'N/A'}</td>
                                <td>
                                    <button onClick={() => openStoreDetailsModal(store.id)} className="view-details-btn">
                                        <i className="fas fa-eye"></i> View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Store Details Modal */}
            {showStoreDetailsModal && selectedStoreDetails && (
                <div className="store-details-modal-overlay">
                    <div className="store-details-modal-container">
                        <h3 className="modal-title">Store Details: {selectedStoreDetails.name}</h3>
                        <p><strong>Email:</strong> {selectedStoreDetails.email}</p>
                        <p><strong>Address:</strong> {selectedStoreDetails.address}</p>
                        <p><strong>Overall Rating:</strong> {selectedStoreDetails.overall_rating}</p>

                        <h4>User Ratings</h4>
                        {selectedStoreDetails.ratings && selectedStoreDetails.ratings.length > 0 ? (
                            <div className="ratings-list-container">
                                {selectedStoreDetails.ratings.map((rating, index) => (
                                    <div key={index} className="user-rating-item">
                                        <p><strong>User:</strong> {rating.user_name} ({rating.user_email})</p>
                                        <p><strong>Rating:</strong> {rating.rating}/5</p>
                                        <p><strong>Rated At:</strong> {new Date(rating.created_at).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No ratings yet for this store.</p>
                        )}

                        <button onClick={closeStoreDetailsModal} className="close-modal-btn">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStores;
