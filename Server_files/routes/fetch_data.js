const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route to fetch and insert categories from local JSON file
router.post('/fetch_categories', (req, res) => {
    const db = req.db;
    const jsonFilePath = path.join(__dirname, '../data.json'); // Path to data.json


    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, message: 'Error reading JSON file' });
        }

        const jsonData = JSON.parse(data);

        // Extract specific categories
        const categoriesToInsert = jsonData.categories.filter(category => {
            return ['5', '42', '7', '57', '67'].includes(category.id);
        });

        // Insert categories into the database
        const insertPromises = categoriesToInsert.map(category => {
            const sql = 'INSERT INTO category (category_id, category_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)';
            return new Promise((resolve, reject) => {
                db.query(sql, [category.id, category.category_name], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });

        Promise.all(insertPromises)
            .then(() => res.json({ success: true, message: 'Categories inserted successfully' }))
            .catch(err => {
                console.error('Error inserting categories:', err);
                res.status(500).json({ success: false, message: 'Error inserting categories' });
            });
    });
});

module.exports = router;
