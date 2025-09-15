const router = require('express').Router();
const { auth, authorize } = require('./auth');
const db = require('../db');

// Protect all owner routes
router.use(auth);
router.use(authorize(['Store Owner']));

// Owner Dashboard: View store details, average rating, and user ratings for their store(s)
router.get('/dashboard', async (req, res) => {
    const ownerId = req.user.id;

    try {
        // Fetch stores owned by this owner
        const [stores] = await db.query('SELECT id, name, email, address FROM stores WHERE owner_id = ?', [ownerId]);
        if (stores.length === 0) {
            return res.status(404).json({ msg: 'No stores found for this owner.' });
        }

        // For simplicity, we'll aggregate data for the first store if an owner has multiple.
        // In a more complex scenario, you'd iterate or allow selection.
        const primaryStoreId = stores[0].id;

        // Get average rating for the primary store
        const [averageRatingResult] = await db.query(
            'SELECT AVG(rating) AS average_rating FROM ratings WHERE store_id = ?',
            [primaryStoreId]
        );
        const average_rating = averageRatingResult[0].average_rating ? parseFloat(averageRatingResult[0].average_rating).toFixed(2) : 'N/A';

        // Get users who have submitted ratings for the primary store
        const [userRatings] = await db.query(
            `SELECT u.id AS user_id, u.name AS user_name, u.email AS user_email, r.rating, r.created_at
             FROM users u
             JOIN ratings r ON u.id = r.user_id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [primaryStoreId]
        );

        res.status(200).json({
            store: stores[0],
            average_rating,
            user_ratings: userRatings,
        });

    } catch (err) {
        console.error('Error fetching owner dashboard data:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
