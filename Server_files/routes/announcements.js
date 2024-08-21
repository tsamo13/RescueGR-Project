const express = require('express');
const router = express.Router();

// Route to handle creating a new announcement
router.post('/create_announcement', (req, res) => {
    const { title, description, item_name } = req.body;

    // Validate required fields
    if (!title || !item_name) {
        return res.status(400).json({ success: false, message: 'Title and Item Name are required' });
    }

    const createdAt = new Date(); // Get the current date and time

    // Insert the new announcement into the database
    const sql = 'INSERT INTO announcement (title, description, created_at, item_name) VALUES (?, ?, ?, ?)';
    req.db.query(sql, [title, description, createdAt, item_name], (err, result) => {
        if (err) {
            console.error('Error inserting announcement:', err);
            return res.status(500).json({ success: false, message: 'Failed to create announcement' });
        }

        res.json({ success: true, message: 'Announcement created successfully!' });
    });
});

module.exports = router;