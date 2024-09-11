const express = require('express');
const router = express.Router();


// Route to fetch categories and their items
router.get('/get_categories_items', (req, res) => {

    // Query to get all items with their respective categories
    const itemsQuery = `
        SELECT item_name, quantity
        FROM item 
    `;


        req.db.query(itemsQuery, (err, items) => {
            if (err) {
                console.error('Error fetching items:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch items' });
            }

            // Send back both the categories and items
            res.json({ success: true,items});
        });
    
});

// Route to get the rescuer's load (along with their location)
router.get('/get_rescuer_load', (req, res) => {
    // Assuming req.session.user contains signed-in user's information
    if (!req.session.user) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.session.user.id; // This is the user ID stored in the session

    // First, get the rescuer_id using the user_id
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

        // Now fetch the load for the signed-in rescuer
        const loadQuery = 'SELECT item_name, quantity FROM rescuer_load WHERE rescuer_id = ?';

        req.db.query(loadQuery, [rescuerId], (err, loadResults) => {
            if (err) {
                console.error('Error fetching rescuer load:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch load data' });
            }

            // Send the rescuer's load to the frontend
            res.json({ success: true, load: loadResults });
        });
    });
});


module.exports = router;