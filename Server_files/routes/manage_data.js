const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route to fetch and insert categories and items from local JSON file
router.post('/insert_data', (req, res) => {
    const db = req.db;
    const jsonFilePath = path.join(__dirname, '../data.json'); // Path to data.json

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, message: 'Error reading JSON file' });
        }

        
        const jsonData = JSON.parse(data);

         // Extract and insert categories into the database
        const categoriesToInsert = jsonData.categories.filter(category => {
            return ['5', '42', '7', '57', '67', '1'].includes(category.id); 
        });

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
            // Fetch all categories and items after insertion
            const fetchCategories = new Promise((resolve, reject) => {
                db.query('SELECT * FROM category', (err, categories) => {
                    if (err) return reject(err);
                    resolve(categories);
                });
            });

            const fetchItems = new Promise((resolve, reject) => {
                const sql = `SELECT item.item_name, item.description, item.quantity, category.category_name
                             FROM item
                             JOIN category ON item.category_id = category.category_id`;
                db.query(sql, (err, items) => {
                    if (err) return reject(err);
                    resolve(items);
                });
            });

            return Promise.all([fetchCategories, fetchItems]);
        })
        .then(([categories, items]) => {
            res.json({ success: true, categories: categories, items: items });
        })
        .catch(err => {
            console.error('Error inserting categories or items:', err);
            res.status(500).json({ success: false, message: 'Error inserting categories or items' });
        });
});
});


// Route to delete all categories and items from the database
router.post('/delete_data', (req, res) => {
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


// Route to add a new category
router.post('/add_category', (req, res) => {
    const db = req.db;
    const { categoryName } = req.body;

    if (!categoryName) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const sql = 'INSERT INTO category (category_name) VALUES (?)';
    db.query(sql, [categoryName], (err, result) => {
        if (err) {
            console.error('Error adding category:', err);
            return res.status(500).json({ success: false, message: 'Failed to add category' });
        }

        res.json({ success: true, message: 'Category added successfully' });
    });
});

// Route to delete a category
router.post('/delete_category', (req, res) => {
    const db = req.db;
    const { categoryName } = req.body;

    if (!categoryName) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // SQL query to delete the category and related items
    const deleteItemsSql = 'DELETE FROM item WHERE category_id = (SELECT category_id FROM category WHERE category_name = ?)';
    const deleteCategorySql = 'DELETE FROM category WHERE category_name = ?';

    db.query(deleteItemsSql, [categoryName], (err, result) => {
        if (err) {
            console.error('Error deleting items:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete items' });
        }

        db.query(deleteCategorySql, [categoryName], (err, result) => {
            if (err) {
                console.error('Error deleting category:', err);
                return res.status(500).json({ success: false, message: 'Failed to delete category' });
            }
            if (result.affectedRows === 0) {
                // If no rows were affected, the category was not found in the database
                console.error('No category found with the provided name:', categoryName);
                return res.status(404).json({ success: false, message: `Category "${categoryName}" not found` });
            }
            res.json({ success: true, message: 'Category and related items deleted successfully' });
        });
    });
});

// Route to add a new product
router.post('/add_product', (req, res) => {
    const db = req.db;
    const { name, details, quantity, category } = req.body;

    // SQL query to insert the new product into the database
    const sql = 'INSERT INTO item (item_name, description, quantity, category_id) VALUES (?, ?, ?, (SELECT category_id FROM category WHERE category_name = ?))';

    db.query(sql, [name, details, quantity, category], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ success: false, message: 'Failed to add product' });
        }

        res.json({ success: true, message: 'Product added successfully' });
    });
});

// Route to delete a specific product from the database
router.post('/delete_product', (req, res) => {
    const db = req.db;
    const { productName } = req.body;

    const deleteProductSql = 'DELETE FROM item WHERE item_name = ?';
    
    db.query(deleteProductSql, [productName], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ success: false, message: 'Error deleting product' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    });
});


// Route to edit a product in the database
router.post('/edit_product', (req, res) => {
    const db = req.db;
    const { originalProductName, newProductName, newProductDetails, newProductQuantity } = req.body;

    const sql = 'UPDATE item SET item_name = ?, description = ?, quantity = ? WHERE item_name = ?';
    db.query(sql, [newProductName, newProductDetails, newProductQuantity, originalProductName], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ success: false, message: 'Error updating product' });
        }
        res.json({ success: true, message: 'Product updated successfully' });
    });
});

// Route to fetch all categories and items from the database
router.get('/get_all_data', (req, res) => {
    const db = req.db;

    const fetchCategories = () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM category', (err, categories) => {
                if (err) return reject(err);
                resolve(categories);
            });
        });
    };

    const fetchItems = () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT i.item_name, i.description, i.quantity, c.category_name
                FROM item i
                JOIN category c ON i.category_id = c.category_id
            `;
            db.query(sql, (err, items) => {
                if (err) return reject(err);
                resolve(items);
            });
        });
    };

    Promise.all([fetchCategories(), fetchItems()])
        .then(results => {
            const [categories, items] = results;
            res.json({ success: true, categories: categories, items: items });
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).json({ success: false, message: 'Error fetching data' });
        });
});

// Route to fetch all rescuers and their locations
router.get('/fetch_rescuers', (req, res) => {
    const db = req.db;

    const sql = `
        SELECT u.name, ST_X(u.location) AS lat, ST_Y(u.location) AS lng, availability
        FROM rescuer r
        JOIN user u ON r.user_id = u.user_id
        WHERE u.location IS NOT NULL
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching rescuers:', err);
            return res.status(500).json({ success: false, message: 'Error fetching rescuers' });
        }

        res.json({ success: true, rescuers: results });
    });
});

// Route to update rescuer availability
router.post('/update_rescuer_availability', (req, res) => {
    const { rescuer_id, availability } = req.body;
    
    const updateSql = `UPDATE rescuer SET availability = ? WHERE rescuer_id = ?`;

    req.db.query(updateSql, [availability, rescuer_id], (err, result) => {
        if (err) {
            console.error('Error updating rescuer availability:', err);
            return res.status(500).json({ success: false, message: 'Error updating rescuer availability' });
        }

        res.json({ success: true, message: 'Rescuer availability updated successfully!' });
    });
});


router.get('/get_products', (req, res) => {
    const sql = 'SELECT item_id AS id, item_name AS name FROM item';
    req.db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ success: false, message: 'Error fetching products' });
            return;
        }

        res.json({ success: true, products: results });
    });
});


// Route to fetch warehouse stock
router.get('/get_stock', (req, res) => {
    const query = `
        SELECT item_name, quantity
        FROM item
    `;

    req.db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching warehouse stock:', error);
            return res.status(500).json({ success: false, message: 'Error fetching warehouse stock.' });
        }
        res.json({ success: true, stock: results });
    });
});


// Route to handle rescuer loading an item
router.post('/load_item', (req, res) => {
    const { item_name, quantity } = req.body;
    const userId = req.session.user.id; // Getting user_id from session data

    // Query to fetch the rescuer_id from the rescuer table using the user_id
    const getRescuerIdSql = `
        SELECT rescuer_id 
        FROM rescuer 
        WHERE user_id = ?
    `;

    // Check if the item already exists in the rescuer's load
    const checkLoadQuery = `
        SELECT quantity 
        FROM rescuer_load 
        WHERE rescuer_id = ? AND item_name = ?
        `;

    // Deduct item from warehouse and add to rescuer_load table
    const deductItemSql = `
        UPDATE item 
        SET quantity = quantity - ?
        WHERE item_name = ? 
    `;

    //Add the item to rescuer_load    
    const addToRescuerLoadSql = `
        INSERT INTO rescuer_load (rescuer_id, item_name, quantity)
        VALUES (?, ?, ?)
    `;

    // Start by fetching the rescuer_id
    req.db.query(getRescuerIdSql, [userId], (err, result) => {
        if (err || result.length === 0) {
            console.error('Error fetching rescuer ID:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch rescuer ID' });
        }

        const rescuerId = result[0].rescuer_id;

        // Now deduct item from database
        req.db.query(deductItemSql, [quantity, item_name], (err, result) => {
            if (err || result.affectedRows === 0) {
                console.error('Error deducting item:', err);
                return res.status(400).json({ success: false, message: 'Insufficient stock or error updating warehouse.' });
            }   

            req.db.query(checkLoadQuery, [rescuerId, item_name], (err, result) => { 
                if (err) {
                    console.error('Error checking rescuer load:', err);
                    return res.status(500).json({ success: false, message: 'Failed to check load data' });
                }
        
                if (result.length > 0) {
                    // If the item already exists, update the quantity
                    const currentQuantity = result[0].quantity;
                    const newQuantity = parseInt(currentQuantity, 10) + parseInt(quantity, 10);
                    

                    const updateQuery = 'UPDATE rescuer_load SET quantity = ? WHERE rescuer_id = ? AND item_name = ?';
                    req.db.query(updateQuery, [newQuantity, rescuerId, item_name], (err) => {
                        if (err) {
                            console.error('Error updating rescuer load:', err);
                            return res.status(500).json({ success: false, message: 'Failed to update load data' });
                        }
        
                        res.json({ success: true, message: 'Item quantity updated in load' });
                    });
                } else {
                    // If the item doesn't exist, insert a new record
                    const insertQuery = 'INSERT INTO rescuer_load (rescuer_id, item_name, quantity) VALUES (?, ?, ?)';
                    req.db.query(insertQuery, [rescuerId, item_name, quantity], (err) => {
                        if (err) {
                            console.error('Error inserting into rescuer load:', err);
                            return res.status(500).json({ success: false, message: 'Failed to load item' });
                        }
        
                        res.json({ success: true, message: 'Item loaded into rescuer load' });
                    });
                }
            });
        });
    });
});    


// Route to handle unloading an item
router.post('/unload_item', (req, res) => {
    const { itemName, quantity } = req.body;

    // Check if the user is logged in
    if (!req.session.user) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    // First, get the rescuer_id using the user_id
    const getRescuerIdSql = 'SELECT rescuer_id FROM rescuer WHERE user_id = ?';

    req.db.query(getRescuerIdSql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching rescuer_id:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Rescuer not found for this user' });
        }

        const rescuerId = result[0].rescuer_id;

    // First, get the current quantity of the item from the rescuer's load
    const getLoadQuery = 'SELECT quantity FROM rescuer_load WHERE rescuer_id = ? AND item_name = ?';
    
    req.db.query(getLoadQuery, [rescuerId, itemName], (err, result) => {
        if (err) {
            console.error('Error fetching rescuer load:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch load data' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in rescuer load' });
        }

        const currentQuantity = result[0].quantity;
        const newQuantity = currentQuantity - quantity;

        if (newQuantity > 0) {
            // Update the quantity if it's still greater than 0
            const updateQuery = 'UPDATE rescuer_load SET quantity = ? WHERE rescuer_id = ? AND item_name = ?';
            req.db.query(updateQuery, [newQuantity, rescuerId, itemName], (err) => {
                if (err) {
                    console.error('Error updating rescuer load:', err);
                    return res.status(500).json({ success: false, message: 'Failed to update load data' });
                }
            });
        } else {
            // Delete the item from the rescuer's load if the quantity is 0 or less
            const deleteQuery = 'DELETE FROM rescuer_load WHERE rescuer_id = ? AND item_name = ?';
            req.db.query(deleteQuery, [rescuerId, itemName], (err) => {
                if (err) {
                    console.error('Error deleting item from rescuer load:', err);
                    return res.status(500).json({ success: false, message: 'Failed to delete item from load' });
                }
            });
        }
    });

            // 2. Update item table to add back the quantity
            const updateItemSql = `
                UPDATE item
                SET quantity = quantity + ?
                WHERE item_name = ?`;

            req.db.query(updateItemSql, [quantity, itemName], (err, result) => {
                if (err) {
                    console.error('Error updating item quantity:', err);
                    return res.status(500).json({ success: false, message: 'Failed to update item quantity' });
                }

                // Everything is successful
                res.json({ success: true, message: 'Item unloaded successfully' });
            });
        });
    });



// Route to handle unloading all items
router.post('/unload_all_items', (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.session.user.id; // Get user ID from session

    // First, get the rescuer_id using the user_id
    const getRescuerIdSql = 'SELECT rescuer_id FROM rescuer WHERE user_id = ?';

    req.db.query(getRescuerIdSql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching rescuer_id:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Rescuer not found for this user' });
        }

        const rescuerId = result[0].rescuer_id;

        // 1. Fetch all items from the rescuer's load
        const getLoadSql = 'SELECT item_name, quantity FROM rescuer_load WHERE rescuer_id = ?';

        req.db.query(getLoadSql, [rescuerId], (err, loadResults) => {
            if (err) {
                console.error('Error fetching rescuer load:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch rescuer load' });
            }

            if (loadResults.length === 0) {
                return res.status(400).json({ success: false, message: 'No items to unload' });
            }

            // 2. Update item table for each load item
            const updatePromises = loadResults.map(loadItem => {
                const updateItemSql = `
                    UPDATE item
                    SET quantity = quantity + ?
                    WHERE item_name = ?
                `;
                return new Promise((resolve, reject) => {
                    req.db.query(updateItemSql, [loadItem.quantity, loadItem.item_name], (err, result) => {
                        if (err) {
                            console.error('Error updating item quantity:', err);
                            return reject('Failed to update item quantity');
                        }
                        resolve();
                    });
                });
            });

            // 3. Once all updates are successful, clear the rescuer_load
            Promise.all(updatePromises)
                .then(() => {
                    const clearLoadSql = 'DELETE FROM rescuer_load WHERE rescuer_id = ?';

                    req.db.query(clearLoadSql, [rescuerId], (err, result) => {
                        if (err) {
                            console.error('Error clearing rescuer load:', err);
                            return res.status(500).json({ success: false, message: 'Failed to clear rescuer load' });
                        }

                        // All items unloaded successfully
                        res.json({ success: true, message: 'All items unloaded successfully' });
                    });
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).json({ success: false, message: 'Error unloading all items' });
                });
        });
    });
});



module.exports = router;

