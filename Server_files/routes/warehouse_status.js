// Import necessary modules at the top if not already imported
const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Fetch categories and products
router.get('/', (req, res) => {
    const db = req.db; // Assuming the db connection is set in middleware

    const categoriesQuery = 'SELECT category_name FROM category';
    const productsQuery = `
        SELECT 
            item.item_name AS name, 
            category.category_name AS category, 
            item.quantity AS at_base
        FROM item
        JOIN category ON item.category_id = category.category_id
    `;

    const data = {};

    // Fetch categories
    db.query(categoriesQuery, (err, categoriesResult) => {
        if (err) {
            console.error('Error fetching categories:', err);
            res.status(500).json({ success: false, message: 'Server error' });
            return;
        }

        data.categories = categoriesResult;

        // Fetch products
        db.query(productsQuery, (err, productsResult) => {
            if (err) {
                console.error('Error fetching products:', err);
                res.status(500).json({ success: false, message: 'Server error' });
                return;
            }

            data.products = productsResult;
            res.json(data);
        });
    });
});

module.exports = router;
