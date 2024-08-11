const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route to fetch and insert categories and items from local JSON file
router.post('/fetch_data', (req, res) => {
    const db = req.db;
    const jsonFilePath = path.join(__dirname, '../data.json'); // Path to data.json

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, message: 'Error reading JSON file' });
        }
        
        console.log('JSON file read successfully');  // Log this to confirm JSON file was read

        const jsonData = JSON.parse(data);

        // Extract specific categories
        const categoriesToInsert = jsonData.categories.filter(category => {
            return ['5', '42', '7', '57', '67', '1'].includes(category.id); // including '1' for 'Water' category
        });

        // Insert categories into the database
        const insertCategoryPromises = categoriesToInsert.map(category => {
            const sql = 'INSERT INTO category (category_id, category_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)';
            return new Promise((resolve, reject) => {
                db.query(sql, [category.id, category.category_name], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });

        // Extract and insert items into the database
        const itemsToInsert = jsonData.items;
        const insertItemPromises = itemsToInsert.map(item => {
            const description = item.details.map(detail => `${detail.detail_name}: ${detail.detail_value}`).join('\n');
            const sql = 'INSERT INTO item (item_id, category_id, item_name, description, quantity) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE item_name = VALUES(item_name), description = VALUES(description), quantity = VALUES(quantity)';
            return new Promise((resolve, reject) => {
                db.query(sql, [item.id, item.category, item.name, description, 10], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });

        // Wait for all category and item insertions to complete
        Promise.all([...insertCategoryPromises, ...insertItemPromises])
            .then(() => res.json({ success: true, message: 'Categories and items inserted successfully' }))
            .catch(err => {
                console.error('Error inserting categories or items:', err);
                res.status(500).json({ success: false, message: 'Error inserting categories or items' });
            });
    });
});

module.exports = router;
