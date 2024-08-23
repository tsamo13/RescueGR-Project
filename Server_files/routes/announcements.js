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

// Route to fetch all announcements
router.get('/get_announcements', (req, res) => {
    const sql = 'SELECT title, item_name FROM announcement ORDER BY created_at DESC';

    req.db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
        }

        res.json({ success: true, announcements: results });
    });
});

// Route to delete an announcement
router.post('/delete_announcement', (req, res) => {
    const { title } = req.body;

    const sql = 'DELETE FROM announcement WHERE title = ?';
    req.db.query(sql, [title], (err, result) => {
        if (err) {
            console.error('Error deleting announcement:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete announcement' });
        }

        res.json({ success: true, message: 'Announcement deleted successfully!' });
    });
});

module.exports = router;
