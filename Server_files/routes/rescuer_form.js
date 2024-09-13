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

// Route to load items into the rescuer's vehicle
router.post('/load_items', (req, res) => {
    const { rescuer_id, item_name, quantity, offer_id } = req.body;

    // Check if the item already exists in the rescuer_load table for the rescuer
    const checkQuery = 'SELECT * FROM rescuer_load WHERE rescuer_id = ? AND item_name = ? AND offer_id = ?';
    req.db.query(checkQuery, [rescuer_id, item_name,offer_id], (err, result) => {
        if (err) {
            console.error('Error checking for existing item in rescuer_load:', err);
            return res.status(500).json({ success: false, message: 'Server error while checking existing items.' });
        }

        if (result.length > 0) {
            // Item already exists, update the quantity
            const updateQuery = 'UPDATE rescuer_load SET quantity = quantity + ? WHERE rescuer_id = ? AND item_name = ? AND offer_id = ?';
            req.db.query(updateQuery, [quantity, rescuer_id, item_name,offer_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating item quantity in rescuer_load:', err);
                    return res.status(500).json({ success: false, message: 'Server error while updating item quantity.' });
                }
                return res.json({ success: true, message: 'Item quantity updated successfully.' });
            });
        } else {
            // Item does not exist, insert a new record
            const insertQuery = 'INSERT INTO rescuer_load (rescuer_id,offer_id, item_name, quantity) VALUES (?, ?, ?,?)';
            req.db.query(insertQuery, [rescuer_id, offer_id, item_name, quantity], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting new item into rescuer_load:', err);
                    return res.status(500).json({ success: false, message: 'Server error while inserting new item.' });
                }
                return res.json({ success: true, message: 'Item loaded successfully.' });
            });
        }
    });
});

// Route to check if items are already loaded
router.get('/check_if_loaded', (req, res) => {
    const { rescuer_id, offer_id } = req.query;

    const checkQuery = 'SELECT COUNT(*) AS count FROM rescuer_load WHERE rescuer_id = ? AND offer_id = ?';

    req.db.query(checkQuery, [rescuer_id, offer_id], (err, results) => {
        if (err) {
            console.error('Error checking load status:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        

        const alreadyLoaded = results[0].count > 0;
        res.json({ success: true, alreadyLoaded });
    });
});


module.exports = router;