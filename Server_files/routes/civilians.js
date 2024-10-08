const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // To hash the password

// Route to handle civilian sign-up
router.post('/sign_up', async (req, res) => {
    const db = req.db;
    const { username, password, name, telephone, latitude, longitude } = req.body;

        console.log('Received sign-up data:', req.body); // Log the incoming data


    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Combine latitude and longitude into a single location string
        const location = `POINT(${longitude} ${latitude})`;

        // Set the role as 'civilian'
        const userType = 3;
        const role = 'civilian';

        // Insert the new civilian into the database
        const sql = 'INSERT INTO user (username, password, name, phone, user_type, role, location) VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText(?))';
        db.query(sql, [username, hashedPassword, name, telephone,userType, role, location], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }


            //Insert the new civilian into the civilian table
            const civilianSql = 'INSERT INTO civilian (user_id) VALUES (?)';
            db.query(civilianSql, [result.insertId], (err,result) => {
                if (err) {
                    console.error('Error inserting into civilian table:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }


                // On success, send a positive response
                res.json({ success: true, message: 'Civilian account created successfully!' });
            });
        });
    } catch (error) {
        console.error('Error handling sign-up:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;
