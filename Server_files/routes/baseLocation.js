const express = require('express');
const router = express.Router();


// Route to get the base location
router.get('/get_base_location', (req, res) => {
    const db = req.db;
    const query = 'SELECT ST_X(location) AS lat, ST_Y(location) AS lng FROM db_location WHERE id = 1';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving base location:', err);
            return res.json({ success: false });
        }
        if (result.length > 0) {
            res.json({ success: true, location: result[0] });
        } else {
            res.json({ success: false });
        }
    });
});

// Route to update the base location
router.post('/update_base_location', (req, res) => {
    const db=req.db;
    const { lat, lng } = req.body;
    const query = 'INSERT INTO db_location (id, location) VALUES (1, POINT(?, ?)) ON DUPLICATE KEY UPDATE location=POINT(?, ?)';
    db.query(query, [lat, lng, lat, lng], (err, result) => {
        if (err) {
            console.error('Error updating base location:', err);
            return res.json({ success: false, message: 'Database update failed.' });
        }
        res.json({ success: true, message: 'Base location updated successfully.' });
    });
});

module.exports = router;