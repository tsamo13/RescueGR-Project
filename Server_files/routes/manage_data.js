const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route to fetch and insert categories and items from local JSON file
router.post('/insert_data', (req, res) => {
    console.log('Insert data route accessed');
    const db = req.db;
    const jsonFilePath = path.join(__dirname, '../data.json'); // Path to data.json

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.log('Fetch data route accessed'); //Debug
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, message: 'Error reading JSON file' });
        }

        
        const jsonData = JSON.parse(data);

        // Extract specific categories
        const categoriesToInsert = jsonData.categories.filter(category => {
            return ['5', '42', '7', '57', '67', '1'].includes(category.id); 
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
         .then(() => {
             // Fetch all categories after insertion
             db.query('SELECT * FROM category', (err, categories) => {
                 if (err) {
                     console.error('Error fetching categories:', err);
                     return res.status(500).json({ success: false, message: 'Error fetching categories' });
                 }
                 res.json({ success: true, categories: categories });
             });
         })
         .catch(err => {
             console.error('Error inserting categories or items:', err);
             res.status(500).json({ success: false, message: 'Error inserting categories or items' });
         });
    });
});


// Route to delete all categories and items from the database
router.post('/delete_data', (req, res) => {
    console.log('Delete data route accessed');
    const db = req.db;

    // SQL queries to delete all records from item and category tables
    const deleteItemsSql = 'DELETE FROM item';
    const deleteCategoriesSql = 'DELETE FROM category';

    // Execute the queries in sequence
    db.query(deleteItemsSql, (err, result) => {
        if (err) {
            console.error('Error deleting items:', err);
            return res.status(500).json({ success: false, message: 'Error deleting items' });
        }

        db.query(deleteCategoriesSql, (err, result) => {
            if (err) {
                console.error('Error deleting categories:', err);
                return res.status(500).json({ success: false, message: 'Error deleting categories' });
            }

            // Send a success response if both deletions succeed
            res.json({ success: true, message: 'All items and categories deleted successfully' });
        });
    });
});

module.exports = router;

