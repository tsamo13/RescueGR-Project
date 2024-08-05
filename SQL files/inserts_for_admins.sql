USE web_project;

-- Insert users into the user table
INSERT INTO user (username, password, name, phone, role, location)
VALUES 
('nikosbel', 'nikosb71', 'Nikos Bel', '1234567890', 'Administrator', POINT(0, 0)),
('aggtsamo', 'ceidgiapanta', 'Agg Tsamo', '1234567891', 'Administrator', POINT(0, 0)),
('chrisk', '123', 'Chris K', '1234567892', 'Administrator', POINT(0, 0));

-- Insert corresponding entries into the administrator table
INSERT INTO administrator (user_id)
SELECT user_id FROM user WHERE username IN ('nikosbel', 'aggtsamo', 'chrisk');

