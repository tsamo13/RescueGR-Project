const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).send('Failed to log out');
        }
        res.status(200).send('Logged out');
    });
});
module.exports = router;    