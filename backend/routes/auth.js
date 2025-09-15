const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// User Registration (Normal User)
router.post('/register', async (req, res) => {
    const { name, email, address, password } = req.body;

    // Basic validation
    if (!name || !email || !address || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Name validation
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ msg: 'Name must be between 20 and 60 characters' });
    }

    // Address validation
    if (address.length > 400) {
        return res.status(400).json({ msg: 'Address cannot exceed 400 characters' });
    }

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
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user to DB
        const [result] = await db.query(
            'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, address, hashedPassword, 'Normal User']
        );
        const newUserId = result.insertId;

        const [newUserRows] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [newUserId]);
        const newUser = newUserRows[0];

        // Generate JWT
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                address: newUser.address,
                role: newUser.role,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// User Login
router.post('/login', async (req, res) => {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Validation failed: Missing email or password');
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('User query result:', userRows);
        if (userRows.length === 0) {
            console.log('User not found with email:', email);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const user = userRows[0];
        console.log('User found:', user.email, 'Role:', user.role);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            console.log('Password mismatch for user:', user.email);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { id: user.id, role: user.role };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err);
                    throw err;
                }
                console.log('JWT signed successfully for user:', user.email);
                res.json({ token, role: user.role });
            }
        );
    } catch (err) {
        console.error('Server error during login:', err.message);
        res.status(500).send('Server Error');
    }
});

// Middleware for authenticating JWT
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    // Log token and JWT_SECRET for debugging
    console.log('Auth Middleware: Received Token:', token);
    console.log('Auth Middleware: JWT_SECRET:', process.env.JWT_SECRET);

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        console.error('Auth Middleware: Token verification failed:', e.message);
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Password Update
router.put('/update-password', auth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ msg: 'Please enter both old and new passwords' });
    }

    // New Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            msg: 'New password must be 8-16 characters long, include at least one uppercase letter and one special character',
        });
    }

    try {
        const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (userRows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const user = userRows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Old password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, req.user.id]);

        res.status(200).json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get authenticated user
router.get('/user', auth, async (req, res) => {
    try {
        const [userRows] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [req.user.id]);
        res.json(userRows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
module.exports.auth = auth;

// Middleware for checking user role
const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
    }
    next();
};

module.exports.authorize = authorize;
