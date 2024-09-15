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
    const checkQuery = 'SELECT * FROM rescuer_load WHERE rescuer_id = ? AND item_name = ?';
    req.db.query(checkQuery, [rescuer_id, item_name,offer_id], (err, result) => {
        if (err) {
            console.error('Error checking for existing item in rescuer_load:', err);
            return res.status(500).json({ success: false, message: 'Server error while checking existing items.' });
        }

        if (result.length > 0) {
            // Item already exists, update the quantity
            const updateQuery = 'UPDATE rescuer_load SET quantity = quantity + ?, offer_id = ? WHERE rescuer_id = ? AND item_name = ?';
            req.db.query(updateQuery, [quantity, offer_id, rescuer_id, item_name], (err, updateResult) => {
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

router.get('/check_if_unloaded', (req, res) => {
    const { rescuer_id, request_id } = req.query;

    const checkQuery = 'SELECT COUNT(*) AS count FROM rescuer_load WHERE rescuer_id = ? AND request_id = ? AND quantity > 0';

    req.db.query(checkQuery, [rescuer_id, request_id], (err, results) => {
        if (err) {
            console.error('Error checking if items are unloaded:', err);
            return res.status(500).json({ success: false, message: 'Server error while checking unloaded status' });
        }

        const alreadyUnloaded = results[0].count > 0;
        res.json({ success: true, alreadyUnloaded });
    });
});

// Route to unload items for a specific request
router.post('/unload_items', (req, res) => {
    const { rescuer_id, item_name, quantity, request_id } = req.body;

    // Check if the items are loaded for this rescuer and item_name
    const checkQuery = 'SELECT * FROM rescuer_load WHERE rescuer_id = ? AND item_name = ?';
    req.db.query(checkQuery, [rescuer_id, item_name], (err, result) => {
        if (err) {
            console.error('Error checking for existing unloaded items:', err);
            return res.status(500).json({ success: false, message: 'Server error while checking loaded items.' });
        }

        if (result.length > 0) {
            const loadedQuantity = result[0].quantity;

            if (loadedQuantity >= quantity) {
                // Subtract the quantity unloaded from the loaded quantity
                const updateQuery = 'UPDATE rescuer_load SET quantity = quantity - ?, request_id = ? WHERE rescuer_id = ? AND item_name = ?';
                req.db.query(updateQuery, [quantity, request_id, rescuer_id, item_name], (err, updateResult) => {
                    if (err) {
                        console.error('Error updating unloaded item quantity:', err);
                        return res.status(500).json({ success: false, message: 'Server error while updating unloaded item quantity.' });
                    }
                    
                    // If the quantity reaches zero, we can optionally remove the row
                    if (loadedQuantity - quantity <= 0) {
                        const deleteQuery = 'DELETE FROM rescuer_load WHERE rescuer_id = ? AND item_name = ?';
                        req.db.query(deleteQuery, [rescuer_id, item_name], (err, deleteResult) => {
                            if (err) {
                                console.error('Error deleting unloaded items:', err);
                                return res.status(500).json({ success: false, message: 'Server error while deleting unloaded items.' });
                            }
                            return res.json({ success: true, message: 'All items unloaded and entry removed.' });
                        });
                    } else {
                        return res.json({ success: true, message: 'Items successfully unloaded and quantity updated.' });
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: 'Not enough items loaded to unload that quantity.' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'No items to unload for this request.' });
        }
    });
});




module.exports = router;