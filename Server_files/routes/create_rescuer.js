const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');


// Helper function to generate random coordinates within a 5 km radius
function getRandomCoordinates(baseLat, baseLng, radius = 5000) {
    const radiusInDegrees = radius / 111000; // Convert meters to degrees
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    const newLat = baseLat + x;
    const newLng = baseLng + y;
    return [newLat, newLng];
}

// Route to handle creating a new rescuer account
router.post('/', async (req, res) => {
    const db = req.db;  
    const { username, password, name, phone } = req.body;


    // Assuming the base location is fixed
    const baseLat = 38.2466; // Example: Patras latitude
    const baseLng = 21.7346; // Example: Patras longitude

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into the user table
        const userQuery = 'INSERT INTO user (username, password, name, phone, user_type, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(userQuery, [username, hashedPassword, name, phone, 2, 'Rescuer'], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({success: false, message: 'This username already exists!' });
            }

            

            // Generate random coordinates for the rescuer's location
            const [rescuerLat, rescuerLng] = getRandomCoordinates(baseLat, baseLng);
            console.log('Generated coordinates:', rescuerLat, rescuerLng);

            // Update the user table with the generated location
            const updateLocationQuery = 'UPDATE user SET location = POINT(?, ?) WHERE user_id = ?';
            db.query(updateLocationQuery, [rescuerLat, rescuerLng, result.insertId], (err) => {
                if (err) {
                    console.error('Error updating user location:', err);
                    return res.status(500).json({ success: false, message: 'Error updating user location' });
                }

            


            // Insert into the rescuer table using the inserted user ID
            const rescuerQuery = 'INSERT INTO rescuer (user_id) VALUES (?)';
            db.query(rescuerQuery, [result.insertId], (err) => {
                if (err) {
                    console.error('Error inserting rescuer:', err);
                    return res.status(500).json({success: false, message: 'This username already exists!' });
                }
               return res.status(201).json({success: true, message: 'Rescuer account created successfully!' });
            });
        });
    });
    } catch (err) {
        console.error('Error during account creation:', err);
        res.status(500).json({success: false, message: 'Server error' });
    }
});


module.exports = router;