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

CREATE INDEX idx_item_name ON item(item_name);

CREATE TABLE IF NOT EXISTS rescuer (
    rescuer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
	availability BOOLEAN DEFAULT TRUE,
    active_task INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);



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

CREATE TABLE IF NOT EXISTS offer (
    offer_id INT PRIMARY KEY AUTO_INCREMENT,
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
    item_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (item_name) REFERENCES item(item_name)
);


CREATE TABLE IF NOT EXISTS civilian (
    civilian_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
    ON DELETE cascade
);

alter table rescuer add foreign key (active_task) REFERENCES task(task_id);

-- Update existing records with appropriate user_type values
UPDATE user SET user_type = 1 WHERE role = 'Administrator';
UPDATE user SET user_type = 2 WHERE role = 'Rescuer';
UPDATE user SET user_type = 3 WHERE role = 'Civilian';


CREATE TABLE db_location(
id INT PRIMARY KEY AUTO_INCREMENT,
location POINT NOT NULL
);

CREATE TABLE rescuer_load (
rescuer_load_id INT PRIMARY KEY AUTO_INCREMENT,
rescuer_id INT,
offer_id INT,
request_id INT,
item_name VARCHAR(100) NOT NULL,
quantity INT NOT NULL,
FOREIGN KEY (rescuer_id) REFERENCES rescuer(rescuer_id)
);

CREATE TABLE unload_items_requests (
    unload_items_request_id INT AUTO_INCREMENT PRIMARY KEY,
    rescuer_id INT NOT NULL,
    request_id INT NOT NULL,
    FOREIGN KEY (rescuer_id) REFERENCES rescuer(rescuer_id),
    FOREIGN KEY (request_id) REFERENCES request(request_id)
);
