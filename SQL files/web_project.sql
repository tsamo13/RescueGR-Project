USE web_project;

CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(15),
    role ENUM('Administrator', 'Rescuer', 'Civilian') NOT NULL,
    location POINT
);

CREATE TABLE category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE item (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE request (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_id INT,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Assigned', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_vehicle_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id),
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicle(vehicle_id)
);

CREATE TABLE offer (
    offer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_id INT,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Assigned', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_vehicle_id INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (item_id) REFERENCES Item(item_id),
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicle(vehicle_id)
);

CREATE TABLE vehicle (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    availability BOOLEAN DEFAULT TRUE,
    active_task INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (active_task) REFERENCES task(task_id)
);

CREATE TABLE task (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    type ENUM('Request', 'Offer') NOT NULL,
    request_id INT,
    offer_id INT,
    status ENUM('Pending', 'Completed', 'Canceled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id),
    FOREIGN KEY (request_id) REFERENCES request(request_id),
    FOREIGN KEY (offer_id) REFERENCES offer(offer_id)
);

CREATE TABLE announcement (
    announcement_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES administrator(admin_id)
);

CREATE TABLE administrator (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE civilian (
    civilian_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE rescuer (
    rescuer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    vehicle_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
);



