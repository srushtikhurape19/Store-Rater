const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { auth, authorize } = require('./auth');
const db = require('../db');

// Middleware to protect admin routes
router.use(auth);
router.use(authorize(['System Administrator']));

// Add new store
router.post('/stores', async (req, res) => {
    const { name, email, address, 
            ownerName, ownerEmail, ownerPassword, ownerAddress } = req.body; // Added owner details

    if (!name || !email || !address || 
        !ownerName || !ownerEmail || !ownerPassword || !ownerAddress) { // Updated validation
        return res.status(400).json({ msg: 'Please enter all store and owner fields' });
    }

    // Store Name validation
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ msg: 'Store name must be between 20 and 60 characters' });
    }

    // Store Address validation
    if (address.length > 400) {
        return res.status(400).json({ msg: 'Store address cannot exceed 400 characters' });
    }

    // Owner Name validation
    if (ownerName.length < 20 || ownerName.length > 60) {
        return res.status(400).json({ msg: 'Owner name must be between 20 and 60 characters' });
    }

    // Owner Address validation
    if (ownerAddress.length > 400) {
        return res.status(400).json({ msg: 'Owner address cannot exceed 400 characters' });
    }

    // Owner Password validation (same as user registration)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
    if (!passwordRegex.test(ownerPassword)) {
        return res.status(400).json({
            msg: 'Owner password must be 8-16 characters long, include at least one uppercase letter and one special character',
        });
    }


    try {
        // Check if store email or name already exists
        const [existingStoreRows] = await db.query('SELECT * FROM stores WHERE email = ? OR name = ?', [email, name]);
        if (existingStoreRows.length > 0) {
            return res.status(400).json({ msg: 'Store with this email or name already exists' });
        }

        // Check if owner email already exists
        const [existingOwnerRows] = await db.query('SELECT * FROM users WHERE email = ?', [ownerEmail]);
        if (existingOwnerRows.length > 0) {
            return res.status(400).json({ msg: 'User with this owner email already exists' });
        }

        // Hash owner password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ownerPassword, salt);

        // Insert new owner (user with 'Store Owner' role)
        const [ownerResult] = await db.query(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [ownerName, ownerEmail, hashedPassword, ownerAddress, 'Store Owner']
        );
        const newOwnerId = ownerResult.insertId;

        // Insert new store, linked to the new owner
        const [storeResult] = await db.query(
            'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
            [name, email, address, newOwnerId]
        );
        const newStoreId = storeResult.insertId;

        const [newStoreRows] = await db.query('SELECT * FROM stores WHERE id = ?', [newStoreId]);
        res.status(201).json(newStoreRows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add new user (Normal User or Admin User)
router.post('/users', async (req, res) => {
    const { name, email, address, password, role } = req.body;

    // Basic validation
    if (!name || !email || !address || !password || !role) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Role validation
    const allowedRoles = ['Normal User', 'System Administrator', 'Store Owner'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ msg: 'Invalid user role' });
    }

    // Name validation
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ msg: 'Name must be between 20 and 60 characters' });
    }

    // Address validation
    if (address.length > 400) {
        return res.status(400).json({ msg: 'Address cannot exceed 400 characters' });
    };

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            msg: 'Password must be 8-16 characters long, include at least one uppercase letter and one special character',
        });
    }

    try {
        // Check for existing user
        const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userRows.length > 0) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, address, hashedPassword, role]
        );
        const newUserId = result.insertId;
        const [newUserRows] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [newUserId]);
        res.status(201).json(newUserRows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all stores with overall rating
router.get('/stores', async (req, res) => {
    console.log('Admin /stores endpoint - Received Query Params:', req.query);
    const { name, email, address, sort_by = 'name', order = 'ASC' } = req.query;
    let query = `SELECT s.id, s.name, s.email, s.address, AVG(r.rating) AS overall_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id`;
    const queryParams = [];
    const conditions = [];

    if (name) {
        conditions.push(`s.name LIKE ?`);
        queryParams.push(`%${name}%`);
    }
    if (email) {
        conditions.push(`s.email LIKE ?`);
        queryParams.push(`%${email}%`);
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
    const allowedSortFields = ['name', 'email', 'address', 'overall_rating'];
    const sortField = allowedSortFields.includes(sort_by.toLowerCase()) ? sort_by.toLowerCase() : 'name';
    const sortOrder = (order.toUpperCase() === 'ASC' || order.toUpperCase() === 'DESC') ? order.toUpperCase() : 'ASC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    console.log('Admin /stores endpoint - Final Query:', query);
    console.log('Admin /stores endpoint - Query Params:', queryParams);

    try {
        const [storesRows] = await db.query(query, queryParams);
        res.status(200).json(storesRows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all normal and admin users
router.get('/users', async (req, res) => {
    console.log('Admin /users endpoint - Received Query Params:', req.query);
    const { name, email, address, role, sort_by = 'name', order = 'ASC' } = req.query;
    let query = `SELECT u.id, u.name, u.email, u.address, u.role FROM users u`;
    const queryParams = [];
    const conditions = [];

    // Filters
    if (name) {
        conditions.push(`u.name LIKE ?`);
        queryParams.push(`%${name}%`);
    }
    if (email) {
        conditions.push(`u.email LIKE ?`);
        queryParams.push(`%${email}%`);
    }
    if (address) {
        conditions.push(`u.address LIKE ?`);
        queryParams.push(`%${address}%`);
    }
    if (role) {
        conditions.push(`u.role LIKE ?`);
        queryParams.push(`%${role}%`);
    }

    // conditions.push(`(u.role = 'Normal User' OR u.role = 'System Administrator')`); // REMOVE THIS LINE

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Sorting
    const allowedSortFields = ['name', 'email', 'address', 'role'];
    const sortField = allowedSortFields.includes(sort_by.toLowerCase()) ? sort_by.toLowerCase() : 'name';
    const sortOrder = (order.toUpperCase() === 'ASC' || order.toUpperCase() === 'DESC') ? order.toUpperCase() : 'ASC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    console.log('Admin /users endpoint - Final Query:', query);
    console.log('Admin /users endpoint - Query Params:', queryParams);

    try {
        const [usersRows] = await db.query(query, queryParams);
        res.status(200).json(usersRows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get details of a single user (including store owner rating if applicable) - Admin only
router.get('/users/:id', auth, authorize(['System Administrator']), async (req, res) => {
    const { id } = req.params;

    try {
        let userQuery = `SELECT id, name, email, address, role FROM users WHERE id = ?`;
        const [userResultRows] = await db.query(userQuery, [id]);

        if (userResultRows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const user = userResultRows[0];

        // If the user is a Store Owner, fetch their overall store rating
        if (user.role === 'Store Owner') {
            const ratingQuery = `SELECT AVG(r.rating) AS owner_overall_rating
                                 FROM stores s
                                 JOIN ratings r ON s.id = r.store_id
                                 WHERE s.owner_id = ?`;
            const [ratingResultRows] = await db.query(ratingQuery, [id]);
            user.overall_rating = ratingResultRows[0].owner_overall_rating ? parseFloat(ratingResultRows[0].owner_overall_rating).toFixed(2) : 'N/A';
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching user details:', err.message);
        res.status(500).send('Server error');
    }
});

// Get details for a specific store including all user ratings (Admin only)
router.get('/stores/:storeId', auth, authorize(['System Administrator']), async (req, res) => {
    const { storeId } = req.params;
    try {
        const [storeRows] = await db.query('SELECT id, name, email, address, owner_id FROM stores WHERE id = ?', [storeId]);
        if (storeRows.length === 0) {
            return res.status(404).json({ msg: 'Store not found' });
        }
        const store = storeRows[0];

        const [ratings] = await db.query(
            'SELECT r.rating, r.created_at, u.name AS user_name, u.email AS user_email FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = ? ORDER BY r.created_at DESC',
            [storeId]
        );

        // Calculate overall rating
        const [overallRatingResult] = await db.query('SELECT AVG(rating) AS overall_rating FROM ratings WHERE store_id = ?', [storeId]);
        const overall_rating = overallRatingResult[0].overall_rating || null;

        res.status(200).json({ ...store, overall_rating: parseFloat(overall_rating).toFixed(2), ratings });
    } catch (err) {
        console.error('Error fetching store details and ratings:', err.message);
        res.status(500).send('Server error');
    }
});

// Get total counts for dashboard
router.get('/dashboard-counts', async (req, res) => {
    try {
        const [totalUsersRows] = await db.query('SELECT COUNT(*) as count FROM users');
        const [totalStoresRows] = await db.query('SELECT COUNT(*) as count FROM stores');
        const [totalRatingsRows] = await db.query('SELECT COUNT(*) as count FROM ratings');

        res.status(200).json({
            totalUsers: parseInt(totalUsersRows[0].count, 10),
            totalStores: parseInt(totalStoresRows[0].count, 10),
            totalRatings: parseInt(totalRatingsRows[0].count, 10),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
