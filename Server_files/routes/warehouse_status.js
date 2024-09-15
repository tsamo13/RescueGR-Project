// Import necessary modules at the top if not already imported
const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Fetch categories and products
router.get('/', (req, res) => {
    const db = req.db; 

    const categoriesQuery = 'SELECT category_name FROM category';
    const productsQuery = `
        SELECT 
            item.item_name AS name, 
            category.category_name AS category, 
            item.quantity AS at_base,
            IFNULL(SUM(rescuer_load.quantity), 0) AS on_vehicles
        FROM item
        JOIN category ON item.category_id = category.category_id
        LEFT JOIN rescuer_load ON item.item_name = rescuer_load.item_name
        GROUP BY item.item_name, category.category_name, item.quantity
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

        // Fetch products and quantities on vehicles
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
