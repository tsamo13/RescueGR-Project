USE web_project;

DELIMITER //

-- Trigger to ensure only one of request_id or offer_id is populated on insert
CREATE TRIGGER before_task_insert
BEFORE INSERT ON task
FOR EACH ROW
BEGIN
    IF NEW.request_id IS NOT NULL THEN
        SET NEW.offer_id = NULL;
    ELSEIF NEW.offer_id IS NOT NULL THEN
        SET NEW.request_id = NULL;
    END IF;
END;
//

-- Trigger to ensure only one of request_id or offer_id is populated on update
CREATE TRIGGER before_task_update
BEFORE UPDATE ON task
FOR EACH ROW
BEGIN
    IF NEW.request_id IS NOT NULL THEN
        SET NEW.offer_id = NULL;
    ELSEIF NEW.offer_id IS NOT NULL THEN
        SET NEW.request_id = NULL;
    END IF;
END;
//

DELIMITER ;
