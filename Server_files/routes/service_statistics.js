const express = require('express');
const router = express.Router();

// Helper function to execute MySQL queries using promises
function queryDatabase(db, query, params) {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

// Route to fetch service statistics
router.get('/ss', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
    }

    const db = req.db;
    const endDateWithTime = `${endDate} 23:59:59`;  // Make sure the endDate includes the entire day

    try {
        // Modified queries to include the full end date and exclude completed requests/offers
        const [newRequestsResult, newOffersResult, completedRequestsResult, completedOffersResult] = await Promise.all([
            queryDatabase(db, 'SELECT COUNT(*) AS newRequests FROM request WHERE created_at BETWEEN ? AND ? AND status != "Completed"', [startDate, endDateWithTime]),
            queryDatabase(db, 'SELECT COUNT(*) AS newOffers FROM offer WHERE created_at BETWEEN ? AND ? AND status != "Completed"', [startDate, endDateWithTime]),
            queryDatabase(db, 'SELECT COUNT(*) AS completedRequests FROM request WHERE completed_at BETWEEN ? AND ?', [startDate, endDateWithTime]),
            queryDatabase(db, 'SELECT COUNT(*) AS completedOffers FROM offer WHERE completed_at BETWEEN ? AND ?', [startDate, endDateWithTime])
        ]);

        const stats = {
            newRequests: newRequestsResult[0].newRequests,
            newOffers: newOffersResult[0].newOffers,
            completedRequests: completedRequestsResult[0].completedRequests,
            completedOffers: completedOffersResult[0].completedOffers,
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching service statistics:', error);
        res.status(500).json({ success: false, message: 'Error fetching service statistics.' });
    }
});

module.exports = router;
