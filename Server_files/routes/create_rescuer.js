const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Route to handle creating a new rescuer account
router.post('/', async (req, res) => {
    const db = req.db;  
    const { username, password, name, phone } = req.body;

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into the user table
        const userQuery = 'INSERT INTO user (username, password, name, phone, user_type, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(userQuery, [username, hashedPassword, name, phone, 2, 'Rescuer'], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({success: false, message: 'This username already exists' });
            }

            // Insert into the rescuer table using the inserted user ID
            const rescuerQuery = 'INSERT INTO rescuer (user_id) VALUES (?)';
            db.query(rescuerQuery, [result.insertId], (err) => {
                if (err) {
                    console.error('Error inserting rescuer:', err);
                    return res.status(500).json({success: false, message: 'This username already exists' });
                }
                res.status(201).json({success: true, message: 'Rescuer account created successfully' });
            });
        });
    } catch (err) {
        console.error('Error during account creation:', err);
        res.status(500).json({success: false, message: 'Server error' });
    }
});


module.exports = router;