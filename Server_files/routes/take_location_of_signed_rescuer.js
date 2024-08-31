const express = require('express');
const router = express.Router();

// Route to get the current rescuer's location
router.get('/get_rescuer_location', (req, res) => {
    console.log('Session data:', req.session);  // This should now show { id: 5, username: 'Alex', user_type: 2 }
    
    if (!req.session.user) {  
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const rescuerId = req.session.user.id;
    const sql = 'SELECT ST_X(location) AS longitude, ST_Y(location) AS latitude FROM user WHERE user_id = ?';

    req.db.query(sql, [rescuerId], (err, results) => {
        if (err) {
            console.error('Error fetching rescuer location:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length > 0) {
            const location = results[0];
            res.json({ success: true, location });
        } else {
            res.json({ success: false, message: 'Location not found' });
        }
    });
});

module.exports = router;