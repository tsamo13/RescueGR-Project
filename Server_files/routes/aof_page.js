const express = require('express');
const router = express.Router();

// Route to fetch all announcements
router.get('/get_announcements', (req, res) => {
    const sql = 'SELECT title, description, item_name, created_at FROM announcement ORDER BY created_at DESC';

    req.db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.json({ success: true, announcements: results });
    });
});

router.post('/create_offer', (req, res) => {
    const userId = req.session.user.id;
    const { item_name, quantity } = req.body;

    const sql = `
        INSERT INTO offer (user_id, quantity, created_at, item_name, assigned_rescuer_id)
        VALUES (?, ?, NOW(), ?, NULL)
    `;

    req.db.query(sql, [userId, quantity, item_name], (err, result) => {
        if (err) {
            console.error('Error creating offer:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        res.json({ success: true, message: 'Offer created successfully!' });
    });
});

router.get('/get_offers_history', (req, res) => {
    const userId = req.session.user.id;

    const sql = `
        SELECT item_name, quantity, status, created_at, accepted_at, completed_at
        FROM offer
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    req.db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching offers history:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.json({ success: true, offers: results });
    });
});

router.delete('/delete_offer', (req, res) => {

    const userId = req.session.user.id;
    const { item_name } = req.body;

    const sql = `
        DELETE FROM offer
        WHERE item_name = ? AND user_id = ? AND status = 'Pending'
    `;

    req.db.query(sql, [item_name, userId], (err, result) => {
        if (err) {
            console.error('Error deleting offer:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Offer deleted successfully!' });
        } else {
            res.json({ success: false, message: 'Failed to delete offer!' });
        }
    });
});

module.exports = router;
