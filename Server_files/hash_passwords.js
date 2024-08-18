const mysql = require('mysql');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'NodejsProject!',
    database: 'web_project'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');

    // Fetch all users
    db.query('SELECT * FROM user', (err, users) => {
        if (err) throw err;

        users.forEach(user => {
            const plainTextPassword = user.password;
            const userId = user.user_id;

            // Hash the existing password
            bcrypt.hash(plainTextPassword, 10, (err, hash) => {
                if (err) throw err;

                // Update the user with the hashed password
                db.query('UPDATE user SET password = ? WHERE user_id = ?', [hash, userId], (err, result) => {
                    if (err) throw err;
                    console.log(`Password for user ID ${userId} hashed and updated successfully.`);
                });
            });
        });
    });
});
