Use web_project;

-- Insert civilians into the user table
INSERT INTO user (username, password, name, phone, role, location, user_type)
VALUES 
('pistoliopoulos', '123', 'Vasilis Toliopoulos', '2345678901', 'Civilian', POINT(1, 1),3),
('waynepinnock', '123', 'Wayne Pinnock', '3456789012', 'Civilian', POINT(2, 2),3),
('tati', '123', 'Tatiana Stefanidou', '4567890123', 'Civilian', POINT(3, 3),3),
('armandduplantis', '123', 'Armand Duplantis', '5678901234', 'Civilian', POINT(4, 4),3),
('michaeljohnson', '123', 'Michael Johnson', '6789012345', 'Civilian', POINT(5, 5),3),
('stefanoschios', '123', 'Stefanos Chios', '7890123456', 'Civilian', POINT(6, 6),3);

-- Insert corresponding entries into the civilian table
INSERT INTO civilian (user_id)
SELECT user_id FROM user WHERE username IN ('pistoliopoulos', 'waynepinnock', 'tati', 'armandduplantis', 'michaeljohnson', 'stefanoschios');

