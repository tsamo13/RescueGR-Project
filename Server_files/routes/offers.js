const express = require('express');
const router = express.Router();



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
            o.completed_at,
            o.assigned_rescuer_id,
            ST_Y(u.location) AS latitude,
            ST_X(u.location) AS longitude,
            rescuer_user.username AS rescuer_username,
            (CASE 
            WHEN t.task_id IS NOT NULL AND (t.status = 'Pending' OR t.status = 'Completed') 
            THEN true 
            ELSE false 
        END) AS is_accepted
        FROM 
            offer o
        JOIN 
            user u ON o.user_id = u.user_id
        LEFT JOIN
            task t ON o.offer_id = t.offer_id
            AND (t.status = 'Pending' OR t.status = 'Completed')
        LEFT JOIN 
            rescuer r ON o.assigned_rescuer_id = r.rescuer_id  -- Join the rescuer table
        LEFT JOIN 
            user rescuer_user ON r.user_id = rescuer_user.user_id  -- Join the user table to get the rescuer's username
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