const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

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

    
    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (isMatch) {
        // Passwords match, login successful

         // Set session data
         req.session.user = {
          id: user.user_id,
          username: user.username,
          user_type: user.user_type
      };
        res.json({ success: true, user_type: user.user_type });
      } else {
        // Passwords do not match
        res.json({ success: false, message: 'Invalid username or password' });
      }
    });
  });
});

module.exports = router;
