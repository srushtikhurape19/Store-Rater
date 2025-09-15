import { useEffect, useState } from 'react';
import '../App.css'; // Import App.css for general styles
import api from '../utils/api';

const StoreList = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        name: '',
        address: '',
    });
    const [sort, setSort] = useState({
        by: 'name',
        order: 'ASC',
    });
    const [selectedRating, setSelectedRating] = useState({}); // To manage rating input for each store
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [currentStoreToRate, setCurrentStoreToRate] = useState(null); // Holds store data for the form
    const [submissionMessage, setSubmissionMessage] = useState({ text: '', type: '' }); // { text: 'Message', type: 'success' | 'error' }

    useEffect(() => {
        fetchStores();
    }, [filters, sort]);

    const fetchStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams(filters);
            queryParams.append('sort_by', sort.by);
            queryParams.append('order', sort.order);
            console.log('Fetching stores with URL:', `/user/stores?${queryParams.toString()}`);
            const res = await api.get(`/user/stores?${queryParams.toString()}`);
            console.log('Stores API response:', res.data);
            setStores(res.data);
            // Log user_submitted_rating for debugging after fetching
            res.data.forEach(store => {
                if (store.user_submitted_rating !== undefined) {
                    console.log(`Store ID: ${store.id}, User Submitted Rating after fetch: ${store.user_submitted_rating}`);
                }
            });
            // Initialize selectedRating state for each store
            const initialRatings = {};
            res.data.forEach(store => {
                initialRatings[store.id] = store.user_submitted_rating || '';
            });
            setSelectedRating(initialRatings);
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

    const handleRatingChange = (storeId, value) => {
        setSelectedRating(prev => ({
            ...prev,
            [storeId]: value,
        }));
    };

    const openRatingForm = (store) => {
        setCurrentStoreToRate(store);
        setSelectedRating(prev => ({ ...prev, [store.id]: store.user_submitted_rating || '' }));
        setShowRatingForm(true);
    };

    const closeRatingForm = () => {
        setShowRatingForm(false);
        setCurrentStoreToRate(null);
    };

    const handleSubmitRating = async (storeId, ratingValue) => {
        const rating = parseInt(ratingValue);
        console.log(`Submitting rating: Store ID ${storeId}, Rating ${rating}`);

        if (!rating || rating < 1 || rating > 5) {
            setSubmissionMessage({ text: 'Please enter a valid rating between 1 and 5.', type: 'error' });
            setTimeout(() => setSubmissionMessage({ text: '', type: '' }), 3000);
            return;
        }

        try {
            const apiUrl = `/user/stores/${storeId}/rate`;
            console.log('Sending rating to API URL:', apiUrl, 'with data:', { rating });
            await api.post(apiUrl, { rating });
            console.log('Rating submitted successfully to backend.');
            setSubmissionMessage({ text: 'Rating submitted successfully!', type: 'success' });
            setTimeout(() => setSubmissionMessage({ text: '', type: '' }), 3000);
            closeRatingForm(); // Close the form after submission
            fetchStores(); // Refresh store list to show updated ratings
        } catch (err) {
            console.error('Error submitting rating (frontend):', err);
            setSubmissionMessage({ text: err.response?.data?.msg || 'Failed to submit rating.', type: 'error' });
            setTimeout(() => setSubmissionMessage({ text: '', type: '' }), 3000);
        }
    };

    if (loading) return <div className="store-list-container">Loading stores...</div>;
    if (error) return <div className="store-list-container alert alert-danger">Error: {error}</div>;

    return (
        <div className="store-list-container">
            <h2 className="page-title"><i className="fas fa-user-circle"></i> Normal User Dashboard</h2>

            {submissionMessage.text && (
                <div className={`submission-message ${submissionMessage.type}`}>
                    {submissionMessage.text}
                </div>
            )}

            {/* Filters */}
            <div className="filter-bar-container">
                <input
                    type="text"
                    placeholder="Search by Name"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Search by Address"
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
                            <th onClick={() => handleSortChange('address')} className="sortable-header">Address {sort.by === 'address' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSortChange('overall_rating')} className="sortable-header">Overall Rating {sort.by === 'overall_rating' && (sort.order === 'ASC' ? '↑' : '↓')}</th>
                            <th>Your Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store) => (
                            <tr key={store.id}>
                                <td>{store.name}</td>
                                <td>{store.address}</td>
                                <td>{store.overall_rating ? parseFloat(store.overall_rating).toFixed(2) : 'N/A'}</td>
                                <td>
                                    {store.user_submitted_rating ? `${store.user_submitted_rating}/5` : 'N/A'}
                                </td>
                                <td>
                                    <button onClick={() => openRatingForm(store)} className="submit-rating-button">
                                        {store.user_submitted_rating ? 'Modify Rating' : 'Submit Rating'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showRatingForm && currentStoreToRate && (
                <div className="rating-form-overlay">
                    <div className="rating-form-container">
                        <h3 className="rating-form-title">Rate {currentStoreToRate.name}</h3>
                        <p className="overall-rating-display">Overall Rating: {currentStoreToRate.overall_rating ? parseFloat(currentStoreToRate.overall_rating).toFixed(2) : 'N/A'}</p>

                        <div className="form-group">
                            <label htmlFor="userRating" className="rating-label">Your Rating (1-5):</label>
                            <div className="star-rating">
                                {[...Array(5)].map((star, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <span
                                            key={ratingValue}
                                            className="star"
                                            onClick={() => handleRatingChange(currentStoreToRate.id, ratingValue)}
                                            style={{
                                                color: ratingValue <= (selectedRating[currentStoreToRate.id] || 0) ? '#ffc107' : '#e4e5e9',
                                                cursor: 'pointer',
                                                fontSize: '2em',
                                                transition: 'color 0.2s ease-in-out'
                                            }}
                                        >
                                            &#9733;
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Future expansion for specific parameters could go here */}
                        {/* <div className="form-group">
                            <label htmlFor="serviceRating">Service:</label>
                            <input type="number" min="1" max="5" className="rating-input-field" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="qualityRating">Quality:</label>
                            <input type="number" min="1" max="5" className="rating-input-field" />
                        </div> */}

                        <div className="rating-form-actions">
                            <button onClick={() => handleSubmitRating(currentStoreToRate.id, selectedRating[currentStoreToRate.id])} className="submit-rating-button">
                                {currentStoreToRate.user_submitted_rating ? 'Update Rating' : 'Submit Rating'}
                            </button>
                            <button onClick={closeRatingForm} className="cancel-button">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreList;
