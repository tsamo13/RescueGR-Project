const express = require('express');
const router = express.Router();

// Route to get the current rescuer's location
router.get('/get_rescuer_location', (req, res) => {
    console.log('Session data:', req.session);  // This should now show { id: 5, username: 'Alex', user_type: 2 }
    
    if (!req.session.user) {  
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.session.user.id; // This is the user ID stored in the session

    // Step 1: Fetch the rescuer_id using the user_id
    const getRescuerIdSql = 'SELECT rescuer_id FROM rescuer WHERE user_id = ?';
    req.db.query(getRescuerIdSql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching rescuer_id:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Rescuer not found for this user' });
        }

        const rescuerId = result[0].rescuer_id;

        // Step 2: Fetch the rescuer's location
        const sql = 'SELECT ST_X(location) AS longitude, ST_Y(location) AS latitude FROM user WHERE user_id = ?';
        req.db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching rescuer location:', err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }

            if (results.length > 0) {
                const location = results[0];
                res.json({ success: true, location, rescuerId });
            } else {
                res.json({ success: false, message: 'Location not found' });
            }
        });
    });
});

// Route to update the rescuer's location
router.post('/update_rescuer_location', (req, res) => {
    const { rescuer_id, latitude, longitude } = req.body;

    // Step 3: Update the user's location
    const sql = 'UPDATE user SET location = POINT(?, ?) WHERE user_id = (SELECT user_id FROM rescuer WHERE rescuer_id = ?)';
    req.db.query(sql, [latitude, longitude, rescuer_id], (err, result) => {
        if (err) {
            console.error('Error updating rescuer location:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.json({ success: true, message: 'Rescuer location updated successfully!' });
    });
});

module.exports = router;
