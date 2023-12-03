/* Create the data base RescueGr_db   */

CREATE SCHEMA RescueGr_db; 


/* Create the table rescuegr_db.UserLogin */


CREATE table rescuegr_db.UserLogin(

username VARCHAR(20) NOT NULL UNIQUE,
user_id INT(9) AUTO_INCREMENT NOT NULL,
user_password  VARCHAR(20) NOT NULL,
user_type INT(1) NOT NULL,  /* 1 = admin, 2 = rescuer , 3 = citizen*/
PRIMARY KEY(user_id)

)engine=InnoDB;



/* Insert data in the table rescuegr_db.UserLogin */


INSERT INTO rescuegr_db.UserLogin VALUES
('nikosmp', NULL, 'nikosp2001!!',1),
('chrikara',NULL,'chrikara2001!!',1),
('aggelos12',NULL,'aggelos2001!!',1),

('giannisKp', NULL, 'giannis1234',2),
('geprge11',NULL,'oq6245',2),
('maria101',NULL,'hinr16',2),

('kyriakosk', NULL, '534fdgf',3),
('mat102',NULL,'41vfdg',3),
('joe405',NULL,'vcsdfds',3),
('greg56',NULL,'fdssfs12',3),
('adria104',NULL,'mbgkgk34',3)
;


select * from rescuegr_db.UserLogin;

