const express = require('express');
const router = express.Router();


// New route to get request locations of the civilians
router.get('/get_request_locations', (req, res) => {
    const query = `
        SELECT 
        r.request_id,
        u.name,
        u.phone,
        r.item_name,
        r.quantity,
        r.status,
        r.created_at,
        r.accepted_at,
        r.completed_at,
        r.assigned_rescuer_id,
        ST_Y(u.location) AS latitude,
        ST_X(u.location) AS longitude,
        (CASE 
            WHEN t.task_id IS NOT NULL AND (t.status = 'Pending' OR t.status = 'Completed') 
            THEN true 
            ELSE false 
        END) AS is_accepted
    FROM 
        request r
    JOIN 
        user u ON r.user_id = u.user_id
    LEFT JOIN
        task t ON r.request_id = t.request_id 
    AND 
        (t.status = 'Pending' OR t.status = 'Completed')
`;

    req.db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error); // Ensure the error is logged
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        res.json({ success: true, requests: results });
    });
});


// Route to fetch categories and items
router.get('/get_categories_items', (req, res) => {
    // Query to get all categories
    const categoriesQuery = 'SELECT * FROM category';

    // Query to get all items
    const itemsQuery = 'SELECT item_name, category_name FROM item JOIN category ON item.category_id = category.category_id';

    // Execute both queries and combine results
    req.db.query(categoriesQuery, (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
        }

        req.db.query(itemsQuery, (err, items) => {
            if (err) {
                console.error('Error fetching items:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch items' });
            }

            // Respond with both categories and items
            res.json({ success: true, categories, items });
        });
    });
});

// Route to handle submitting a new request
router.post('/submit_request', (req, res) => {
    const user_id = req.session.user.id;  // Get the user_id from the session
    const {item_name, quantity } = req.body;

    // Validate required fields
    if (!item_name || !quantity) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Insert the new request into the database
    const sql = 'INSERT INTO request (user_id, item_name, quantity, status) VALUES (?, ?, ?, ?)';
    req.db.query(sql, [user_id, item_name, quantity, 'Pending'], (err, result) => {
        if (err) {
            console.error('Error saving request:', err);
            return res.status(500).json({ success: false, message: 'Failed to save request' });
        }

        res.json({ success: true, message: 'Request submitted successfully!' });
    });
});

// Route to fetch the request history for a user
router.get('/get_request_history', (req, res) => {
    const userId = req.session.user.id;

    const sql = `
        SELECT item_name, quantity, status, created_at, accepted_at, completed_at
        FROM request
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    req.db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching request history:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        res.json({ success: true, requests: results });
    });
});


module.exports = router;
