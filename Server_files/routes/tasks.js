const express = require('express');
const router = express.Router();

// Route to create a task when a request is accepted
router.post('/create_task', (req, res) => {
    const { rescuer_id, request_id } = req.body;
    const type = 'Request'; // Assuming 'Offer' is the type you want
    const status = 'Pending';

    // Check if the request has an existing pending or completed task
    const checkSql = `SELECT * FROM task WHERE request_id = ? AND (status = 'Pending' OR status = 'Completed')`;

    req.db.query(checkSql, [request_id], (err, results) => {
        if (err) {
            console.error('Error checking for existing task:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length > 0) {
            // Task already exists for this request and is either pending or completed
            return res.status(400).json({ success: false, message: 'This request has already been accepted.' });
        }

        // Step 2: Check how many tasks the rescuer currently has that are either pending or completed
        const countTasksSql = `
            SELECT COUNT(*) AS task_count 
            FROM task 
            WHERE rescuer_id = ? 
            AND (status = 'Pending' OR status = 'Completed')
        `;

        req.db.query(countTasksSql, [rescuer_id], (err, result) => {
            if (err) {
                console.error('Error counting rescuer tasks:', err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }

            const taskCount = result[0].task_count;

            // Step 3: Check if the rescuer already has 4 or more tasks
            if (taskCount >= 4) {
                return res.status(400).json({ success: false, message: 'You cannot accept more than 4 tasks.' });
            }



    const sql = 'INSERT INTO task (rescuer_id, type, request_id, status, created_at) VALUES (?, ?, ?, ?, NOW())';

    req.db.query(sql, [rescuer_id, type, request_id, status], (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.json({ success: true, message: 'Task created successfully!' });
    });
});
});
});

// Route to update the task status when a request is rejected or canceled
router.post('/update_task_status', (req, res) => {
    let { rescuer_id, task_id, status } = req.body;

    console.log('Received data: ', { rescuer_id, task_id, status }); // Debugging

    if (!rescuer_id || !task_id || !status) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Updated to ensure that the request_id matches either the request_id or offer_id in the task table.
    const sql = 'UPDATE task SET status = ? WHERE rescuer_id = ? AND task_id = ?'; 

    req.db.query(sql, [status, rescuer_id, task_id], (err, result) => {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (result.affectedRows === 0) {
            // If no rows were updated, it means the task wasn't found or wasn't updated
            return res.status(404).json({ success: false, message: 'Task not found or not updated' });
        }

        res.json({ success: true, message: 'Task status updated successfully!' });
    });
});

// Route to get pending tasks
router.get('/get_pending_tasks', (req, res) => {
    const rescuerId = req.query.rescuerId;

    if (!rescuerId) {
        return res.status(400).json({ success: false, message: 'Rescuer ID is missing' });
    }

    const sql = `
        SELECT t.task_id, u.name AS civilian_name, u.phone AS civilian_phone, t.created_at, t.type, r.item_name, t.status, r.quantity
        FROM task t
        JOIN request r ON t.request_id = r.request_id
        JOIN user u ON r.user_id = u.user_id
        WHERE t.rescuer_id = ? AND t.status = 'Pending'
        UNION
        SELECT t.task_id, u.name AS civilian_name, u.phone AS civilian_phone, t.created_at, t.type, o.item_name, t.status, o.quantity
        FROM task t
        JOIN offer o ON t.offer_id = o.offer_id
        JOIN user u ON o.user_id = u.user_id
        WHERE t.rescuer_id = ? AND t.status = 'Pending'
    `;

    req.db.query(sql, [rescuerId, rescuerId], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ success: false, message: 'Error fetching tasks' });
        }

        res.json({ success: true, tasks: results });
    });
});

module.exports = router;
