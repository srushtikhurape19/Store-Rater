const router = require('express').Router();
const { auth, authorize } = require('./auth');
const db = require('../db');

// Protect all user routes
// router.use(auth);

// Get all stores with overall rating and user's submitted rating
router.get('/stores', auth, async (req, res) => {
    const { name, address, sort_by = 'name', order = 'ASC' } = req.query;
    const userId = req.user ? req.user.id : 1; // Use dummy ID 1 for testing if not authenticated

    let query = `SELECT s.id, s.name, s.address, AVG(r.rating) AS overall_rating,
                 (SELECT ur.rating FROM ratings ur WHERE ur.store_id = s.id AND ur.user_id = ?) AS user_submitted_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id`;
    const queryParams = [userId];
    const conditions = [];

    let placeholderCount = 1;
    if (name) {
        conditions.push(`s.name LIKE ?`);
        queryParams.push(`%${name}%`);
    }
    if (address) {
        conditions.push(`s.address LIKE ?`);
        queryParams.push(`%${address}%`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY s.id`;

    // Sorting
    const allowedSortFields = ['name', 'address', 'overall_rating'];
    const sortField = allowedSortFields.includes(sort_by.toLowerCase()) ? sort_by.toLowerCase() : 'name';
    const sortOrder = (order.toUpperCase() === 'ASC' || order.toUpperCase() === 'DESC') ? order.toUpperCase() : 'ASC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    try {
        const [storesRows] = await db.query(query, queryParams);
        res.status(200).json(storesRows);
    } catch (err) {
        console.error(`Error in /user/stores: ${err.message}`);
        // Log the full error object for more details in development
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Submit or modify a rating for a store (Normal User only)
router.post('/stores/:storeId/rate', auth, authorize(['Normal User']), async (req, res) => {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    console.log(`Backend: Received rating submission for Store ID: ${storeId}, User ID: ${userId}, Rating: ${rating}`);

    if (!rating) {
        return res.status(400).json({ msg: 'Please provide a rating' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    try {
        // Check if store exists
        console.log(`Backend: Checking if store ${storeId} exists.`);
        const [storeRows] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
        if (storeRows.length === 0) {
            console.log(`Backend: Store ${storeId} not found.`);
            return res.status(404).json({ msg: 'Store not found' });
        }

        // Check if user has already rated this store
        console.log(`Backend: Checking for existing rating by user ${userId} for store ${storeId}.`);
        const [existingRatingRows] = await db.query('SELECT * FROM ratings WHERE store_id = ? AND user_id = ?', [storeId, userId]);

        let ratingResult;
        if (existingRatingRows.length > 0) {
            // Update existing rating
            console.log(`Backend: Updating existing rating for store ${storeId}, user ${userId}. Old rating: ${existingRatingRows[0].rating}, New rating: ${rating}`);
            await db.query(
                'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE store_id = ? AND user_id = ?',
                [rating, storeId, userId]
            );
            const [updatedRatingRows] = await db.query('SELECT * FROM ratings WHERE store_id = ? AND user_id = ?', [storeId, userId]);
            ratingResult = updatedRatingRows[0];
            console.log(`Backend: Rating updated. Current rating in DB: ${ratingResult.rating}`, ratingResult);
            res.status(200).json({ msg: 'Rating updated successfully', rating: ratingResult });
        } else {
            // Insert new rating
            console.log(`Backend: Inserting new rating for store ${storeId}, user ${userId}.`);
            const [result] = await db.query(
                'INSERT INTO ratings (store_id, user_id, rating) VALUES (?, ?, ?)',
                [storeId, userId, rating]
            );
            const newRatingId = result.insertId;
            const [newRatingRows] = await db.query('SELECT * FROM ratings WHERE id = ?', [newRatingId]);
            ratingResult = newRatingRows[0];
            console.log(`Backend: New rating inserted.`, ratingResult);
            res.status(201).json({ msg: 'Rating submitted successfully', rating: ratingResult });
        }
    } catch (err) {
        console.error('Backend: Error in submit rating route:', err.message);
        console.error('Backend: Full error object:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
