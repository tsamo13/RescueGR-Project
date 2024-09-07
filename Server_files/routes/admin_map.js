const express = require('express');
const router = express.Router();

//route to get request locations of the civilians
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


// Route to fetch all rescuers and their locations
router.get('/fetch_rescuers', (req, res) => {
    const db = req.db;

    const sql = `
        SELECT u.name, ST_X(u.location) AS lat, ST_Y(u.location) AS lng, availability
        FROM rescuer r
        JOIN user u ON r.user_id = u.user_id
        WHERE u.location IS NOT NULL
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching rescuers:', err);
            return res.status(500).json({ success: false, message: 'Error fetching rescuers' });
        }

        res.json({ success: true, rescuers: results });
    });
});


router.get('/get_offer_locations', (req, res) => {
    const query = `
        SELECT 
            o.offer_id,
            u.name,
            u.phone,
            o.item_name,
            o.quantity,
            o.status,
            o.created_at,
            o.accepted_at,
            o.assigned_rescuer_id,
            ST_Y(u.location) AS latitude,
            ST_X(u.location) AS longitude
        FROM 
            offer o
        JOIN 
            user u ON o.user_id = u.user_id
        WHERE 
            u.location IS NOT NULL
    `;

    req.db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching offer locations:', error);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        res.json({ success: true, offers: results });
    });
});



module.exports = router;