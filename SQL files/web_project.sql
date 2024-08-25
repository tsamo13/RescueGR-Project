USE web_project;

CREATE TABLE IF NOT EXISTS user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(15),
    user_type INT NOT NULL,
    role ENUM('Administrator', 'Rescuer', 'Civilian') NOT NULL,
    location POINT
);

CREATE TABLE IF NOT EXISTS category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS item (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE IF NOT EXISTS rescuer (
    rescuer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
	availability BOOLEAN DEFAULT TRUE,
    active_task INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS request (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_id INT,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Assigned', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_rescuer_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id),
    FOREIGN KEY (assigned_rescuer_id) REFERENCES rescuer(rescuer_id)
);

CREATE TABLE IF NOT EXISTS offer (
    offer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_id INT,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Assigned', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_rescuer_id INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (item_id) REFERENCES Item(item_id),
    FOREIGN KEY (assigned_rescuer_id) REFERENCES rescuer(rescuer_id)
);

CREATE TABLE IF NOT EXISTS task (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    rescuer_id INT,
    type ENUM('Request', 'Offer') NOT NULL,
    request_id INT,
    offer_id INT,
    status ENUM('Pending', 'Completed', 'Canceled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rescuer_id) REFERENCES rescuer(rescuer_id),
    FOREIGN KEY (request_id) REFERENCES request(request_id),
    FOREIGN KEY (offer_id) REFERENCES offer(offer_id)
);

CREATE TABLE IF NOT EXISTS administrator (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS announcement (
    announcement_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES administrator(admin_id)
);


CREATE TABLE IF NOT EXISTS civilian (
    civilian_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);


alter table rescuer add foreign key (active_task) REFERENCES task(task_id);


-- Update existing records with appropriate user_type values
UPDATE user SET user_type = 1 WHERE role = 'Administrator';
UPDATE user SET user_type = 2 WHERE role = 'Rescuer';
UPDATE user SET user_type = 3 WHERE role = 'Civilian';

SHOW CREATE TABLE rescuer;
ALTER TABLE rescuer DROP FOREIGN KEY rescuer_ibfk_1, 
ADD CONSTRAINT rescuer_ibfk_3 FOREIGN KEY (user_id) REFERENCES user(user_id)
ON DELETE CASCADE ON UPDATE CASCADE;


CREATE INDEX idx_item_name ON item(item_name);
ALTER TABLE announcement
DROP FOREIGN KEY announcement_ibfk_1,
DROP COLUMN admin_id,
ADD COLUMN item_name VARCHAR(100) NOT NULL,
ADD CONSTRAINT fk_item_name FOREIGN KEY (item_name) REFERENCES item(item_name);


SHOW CREATE TABLE task;
ALTER TABLE task
DROP FOREIGN KEY task_ibfk_1,
DROP FOREIGN KEY task_ibfk_2,
DROP FOREIGN KEY task_ibfk_3;

-- Step 1: Drop the existing request table if it exists
DROP TABLE IF EXISTS request;

-- Step 2: Create the new request table with the specified fields
CREATE TABLE IF NOT EXISTS request (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Assigned', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,  -- Allows null initially, will be populated when accepted
    completed_at TIMESTAMP NULL, -- Allows null initially, will be populated when completed
    assigned_rescuer_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (item_name) REFERENCES item(item_name),
    FOREIGN KEY (assigned_rescuer_id) REFERENCES rescuer(rescuer_id)
);

