const express = require('express');
const router = express.Router();

// Login route
router.post('/', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM user WHERE username = ?';
  req.db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ success: false, message: 'Server error' });
      return;
    }

    if (results.length === 0) {
      res.json({ success: false, message: 'Invalid username or password' });
      return;
    }

    const user = results[0];

    
    if (password === user.password) {
    
      res.json({ success: true, user_type: user.user_type });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  });
});

module.exports = router;
