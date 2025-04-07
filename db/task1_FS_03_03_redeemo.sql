create database task1_FS_03_03_redeemo;
use task1_FS_03_03_redeemo;

create table tbl_user(
	id bigint(20) primary key auto_increment,
    step enum("start", "verify", "info", "interest"),
    profile_image text default 'default.jpg',
	email varchar(64) unique not null,
    phone varchar(16) not null,
	password text not null,
	first_name varchar(32),
    last_name varchar(32),
    dob date,
    gender enum("male", "female"),
    login_type enum('s', 'g', 'f'),
    social_id varchar(128),
	address TEXT,
	latitude varchar(16),
    longitude varchar(16),
    is_firstTime tinyint(1) default 0,
    is_verified tinyint(1) default 0,
	is_active tinyint(1) default 1,
	is_deleted tinyint(1) default 0,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on update current_timestamp,
	deleted_at timestamp null,
    INDEX idx_email (email)
);

create table tbl_otp (
    id bigint(20) primary key auto_increment,
    user_id bigint(20) not null,
    email varchar(64),
    phone varchar(16),
    otp varchar(6) not null,
    action enum('signup','forgot') default 'signup',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (user_id) references tbl_user(id) on delete cascade
);

CREATE TABLE tbl_device_info (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    device_type ENUM('android', 'ios') NOT NULL,
    device_token TEXT NOT NULL,
    user_token TEXT NOT NULL,
    os_version VARCHAR(16) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
);

CREATE TABLE tbl_user_interest (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    interest_id BIGINT(20) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
);

CREATE TABLE tbl_interest (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(32) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE tbl_categories (
    id bigint(20) AUTO_INCREMENT PRIMARY KEY,
    cover_image TEXT,
    name VARCHAR(32) NOT NULL,
    is_active tinyint(1) DEFAULT 1,
    is_deleted tinyint(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp null
);

CREATE TABLE tbl_service_providers (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,
    category_id BIGINT(20) REFERENCES categories(category_id),
    logo_url TEXT,
    banner_url TEXT,
    avg_rating DECIMAL(2,1),
    rating_count INT DEFAULT 0,
    address TEXT,
    latitude VARCHAR(16),
    longitude VARCHAR(16),
    contact_phone VARCHAR(16),
    contact_email VARCHAR(64),
    is_featured BOOLEAN DEFAULT FALSE,
    opening_hours JSON,
    about text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
);

create table tbl_image(
    id bigint(20) primary key auto_increment,
    service_provider_id bigint(20),
    image text,
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    foreign key (service_provider_id) references tbl_service_providers(id)
);

-- Unary relation to manage branches of restaurants
CREATE TABLE tbl_service_provider_branches (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    main_service_provider_id BIGINT(20) REFERENCES service_providers(id),
    branch_service_provider_id BIGINT(20) REFERENCES service_providers(id),
    is_active tinyint(1) default 1,
	is_deleted tinyint(1) default 0,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on update current_timestamp,
	deleted_at timestamp null
);

-- Table for vouchers
CREATE TABLE tbl_vouchers (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    service_provider_id BIGINT(20) REFERENCES service_providers(id) ON DELETE CASCADE,
    title VARCHAR(64) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    expiry_date DATE,
    is_active tinyint(1) default 1,
	is_deleted tinyint(1) default 0,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp on update current_timestamp,
	deleted_at timestamp null
);

-- Table to track which user has used which voucher
CREATE TABLE tbl_user_vouchers (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) REFERENCES users(id),
    voucher_id BIGINT(20) REFERENCES vouchers(id) ON DELETE CASCADE,
    is_active tinyint(1) default 1,
	created_at timestamp default current_timestamp
);


create table tbl_rating (
    id bigint(20) primary key auto_increment,
    user_id bigint(20) not null,
    service_provider_id bigint(20) not null,
    rating float(2,1) not null,
    CHECK (rating >= 1 AND rating <= 5),
    review text,
	is_active tinyint(1) DEFAULT 1,
    is_deleted tinyint(1) DEFAULT 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
	deleted_at TIMESTAMP NULL,
    foreign key (service_provider_id) references tbl_service_providers(id) on delete cascade,
    foreign key (user_id) references tbl_user(id) on delete cascade    
);


CREATE TABLE tbl_favorites (
	id bigint(20) primary key auto_increment,
    user_id bigint(20) NOT NULL,
    service_provider_id bigint(20),
    voucher_id bigint(20),
    is_voucher tinyint(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_user(id) on delete cascade,
    FOREIGN KEY (service_provider_id) REFERENCES tbl_service_providers(id) on delete cascade,
	FOREIGN KEY (voucher_id) REFERENCES tbl_vouchers(id) on delete cascade
);

create table tbl_notification(
    id bigint(20) primary key auto_increment,
    title varchar(32),
    content text,
    sender_id bigint(20),
    receiver_id bigint(20),
    is_read bool,
    notification_type ENUM('info', 'warning', 'alert') DEFAULT 'info',
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (sender_id) references tbl_user(id),
    foreign key (receiver_id) references tbl_user(id)
);



-- trggers

-- for rating update
-- insert rating trigger
create trigger insert_trigger_rating
after insert on tbl_rating
for each row
update tbl_service_providers p
set avg_rating=(
		select ifnull(round(avg(r.rating),1),0) 
		from tbl_rating r
		where r.service_provider_id = new.service_provider_id
	),
    rating_count = rating_count + 1
where p.id = new.service_provider_id and p.is_active = 1 and p.is_deleted = 0;

--  UPDATE RATING TRIGGER 
create trigger update_trigger_rating
after update on tbl_rating
for each row
update tbl_service_providers p
set avg_rating=(
		select ifnull(round(avg(r.rating),1),0) 
		from tbl_rating r
		where r.service_provider_id = old.service_provider_id
	)
where p.id = old.service_provider_id and p.is_active = 1 and p.is_deleted = 0;

--  DELETE RATING TRIGGER 
create trigger delete_trigger_rating
after delete on tbl_rating
for each row
update tbl_service_providers p
set avg_rating =(
		select ifnull(round(avg(r.rating),1),0)
        from tbl_rating r
        where r.service_provider_id = old.service_provider_id
	),
    rating_count = rating_count - 1
where p.id=old.service_provider_id and p.is_active=1 and p.is_deleted=0;




-- tbl_user
INSERT INTO tbl_user (step, email, phone, password, first_name, last_name, dob, login_type, social_id, address, latitude, longitude, is_verified) VALUES
('info', 'user1@example.com', '1234567890', 'password123', 'John', 'Doe', '1990-01-01', 's', NULL, '123 Main St', '40.7128', '-74.0060', 1),
('verify', 'user2@example.com', '9876543210', 'securepass', 'Jane', 'Smith', '1995-05-15', 'g', 'google123', '456 Oak Ave', '34.0522', '-118.2437', 1),
('interest', 'user3@example.com', '1122334455', 'pass456', 'David', 'Lee', '1988-12-10', 'f', 'facebook456', '789 Pine Ln', '51.5074', '-0.1278', 0),
('start', 'user4@example.com', '5566778899', 'pass789', 'Emily', 'Davis', '2000-07-22', 's', NULL, '101 Elm Rd', '35.6895', '139.6917', 0),
('info', 'user5@example.com', '4433221100', 'pass101', 'Michael', 'Brown', '1976-03-30', 'g', 'google789', '202 Maple Dr', '48.8566', '2.3522', 1),
('verify', 'user6@example.com', '6677889900', 'pass112', 'Sarah', 'Wilson', '1992-09-18', 'f', 'facebook101', '303 Birch Ct', '52.5200', '13.4050', 1),
('interest', 'user7@example.com', '7788990011', 'pass1234', 'Kevin', 'Garcia', '1983-06-05', 's', NULL, '404 Cedar Pl', '37.7749', '-122.4194', 0),
('start', 'user8@example.com', '8899001122', 'pass5678', 'Jessica', 'Rodriguez', '2001-11-28', 'g', 'google112', '505 Willow Way', '41.8781', '-87.6298', 0),
('info', 'user9@example.com', '9900112233', 'pass9012', 'Brian', 'Martinez', '1979-04-12', 'f', 'facebook123', '606 Oakwood Ave', '55.7558', '37.6173', 1),
('verify', 'user10@example.com', '0011223344', 'pass3456', 'Ashley', 'Anderson', '1998-08-08', 's', NULL, '707 Pinecrest Rd', '39.9042', '116.4074', 1);

-- tbl_otp
INSERT INTO tbl_otp (user_id, email, phone, otp, action) VALUES
(1, 'user1@example.com', '1234567890', '123456', 'signup'),
(2, 'user2@example.com', '9876543210', '654321', 'forgot'),
(3, 'user3@example.com', '1122334455', '112233', 'signup'),
(4, 'user4@example.com', '5566778899', '445566', 'forgot'),
(5, 'user5@example.com', '4433221100', '778899', 'signup'),
(6, 'user6@example.com', '6677889900', '990011', 'forgot'),
(7, 'user7@example.com', '7788990011', '223344', 'signup'),
(8, 'user8@example.com', '8899001122', '556677', 'forgot'),
(9, 'user9@example.com', '9900112233', '889900', 'signup'),
(10, 'user10@example.com', '0011223344', '112200', 'forgot');

-- tbl_device_info
INSERT INTO tbl_device_info (user_id, device_type, device_token, user_token, os_version) VALUES
(1, 'android', 'token1', "token1", '10'),
(2, 'ios', 'token2', "token2", '14'),
(3, 'android', 'token3', "token3", '11'),
(4, 'ios', 'token4', "token4", '15'),
(5, 'android', 'token5', "token5", '12'),
(6, 'ios', 'token6', "token6", '16'),
(7, 'android', 'token7', "token7", '13'),
(8, 'ios', 'token8', "token8", '17'),
(9, 'android', 'token9', "token9", '14'),
(10, 'ios', 'token10', "token10", '18');

-- tbl_interest
INSERT INTO tbl_interest (name) VALUES
('Food'), ('Travel'), ('Music'), ('Sports'), ('Movies'),
('Technology'), ('Fashion'), ('Books'), ('Fitness'), ('Art');

-- tbl_user_interest
INSERT INTO tbl_user_interest (user_id, interest_id) VALUES
(1, 1), (1, 3), (2, 2), (2, 4), (3, 5), (3, 6), (4, 7), (4, 8), (5, 9), (5, 10),
(6,1), (7,2),(8,3),(9,4),(10,5);

-- tbl_categories
INSERT INTO tbl_categories (name) VALUES
('Restaurants'), ('Hotels'), ('Gyms'), ('Salons'), ('Events'),
('Shopping'), ('Tours'), ('Education'), ('Healthcare'), ('Entertainment');

-- tbl_service_providers
INSERT INTO tbl_service_providers (name, category_id, logo_url, banner_url, avg_rating, rating_count, address, latitude, longitude, contact_phone, contact_email, is_featured, opening_hours, about) VALUES
('The Italian Place1', 1, 'italian_place_logo.jpg', 'italian_place_banner.jpg', 4.7, 120, '70 Cherry St', '37.7749', '-122.4194', '2233445566', 'info@italianplace.com', 1, '{"Monday": "11:00-22:00", "Tuesday": "11:00-22:00", "Wednesday": "11:00-22:00", "Thursday": "11:00-22:00", "Friday": "11:00-23:00", "Saturday": "12:00-23:00", "Sunday": "12:00-21:00"}', 'Authentic Italian cuisine with a modern twist.'),
('Sunshine Spa1', 4, 'sunshine_spa_logo.jpg', 'sunshine_spa_banner.jpg', 4.9, 85, '80 Beach Rd', '33.8688', '151.2093', '3344556677', 'bookings@sunshinespa.com', 0, '{"Monday": "10:00-20:00", "Tuesday": "10:00-20:00", "Wednesday": "10:00-20:00", "Thursday": "10:00-20:00", "Friday": "10:00-21:00", "Saturday": "10:00-19:00", "Sunday": "Closed"}', 'Relaxing spa treatments and massages.'),
('Adventure Tours1', 7, 'adventure_tours_logo.jpg', 'adventure_tours_banner.jpg', 4.6, 95, '90 Mountain Ave', '-22.9068', '-43.1729', '4455667788', 'tours@adventuretours.com', 1, '{"Monday": "09:00-18:00", "Tuesday": "09:00-18:00", "Wednesday": "09:00-18:00", "Thursday": "09:00-18:00", "Friday": "09:00-18:00", "Saturday": "09:00-17:00", "Sunday": "09:00-17:00"}', 'Exciting outdoor adventures and guided tours.'),
('City Museum1', 10, 'city_museum_logo.jpg', 'city_museum_banner.jpg', 4.4, 70, '100 Park Ln', '41.9028', '12.4964', '5566778899', 'info@citymuseum.com', 0, '{"Monday": "Closed", "Tuesday": "10:00-18:00", "Wednesday": "10:00-18:00", "Thursday": "10:00-20:00", "Friday": "10:00-20:00", "Saturday": "10:00-19:00", "Sunday": "10:00-19:00"}', 'Explore the history and culture of the city.'),
('Tech Solutions1', 6, 'tech_solutions_logo.jpg', 'tech_solutions_banner.jpg', 4.8, 110, '110 Silicon Rd', '37.3382', '-121.8863', '6677889900', 'sales@techsolutions.com', 1, '{"Monday": "09:00-17:00", "Tuesday": "09:00-17:00", "Wednesday": "09:00-17:00", "Thursday": "09:00-17:00", "Friday": "09:00-17:00", "Saturday": "Closed", "Sunday": "Closed"}', 'Providing innovative technology solutions.'),
('Green Gardens Hotel1', 2, 'green_gardens_logo.jpg', 'green_gardens_banner.jpg', 4.5, 90, '120 Forest Ave', '28.6139', '77.2090', '7788990011', 'reservations@greengardens.com', 0, '{"Monday": "24 Hours", "Tuesday": "24 Hours", "Wednesday": "24 Hours", "Thursday": "24 Hours", "Friday": "24 Hours", "Saturday": "24 Hours", "Sunday": "24 Hours"}', 'A tranquil hotel surrounded by lush gardens.'),
('Yoga Studio1', 3, 'yoga_studio_logo.jpg', 'yoga_studio_banner.jpg', 4.9, 100, '130 River Rd', '19.0760', '72.8777', '8899001122', 'info@yogastudio.com', 1, '{"Monday": "07:00-21:00", "Tuesday": "07:00-21:00", "Wednesday": "07:00-21:00", "Thursday": "07:00-21:00", "Friday": "07:00-21:00", "Saturday": "08:00-18:00", "Sunday": "08:00-18:00"}', 'Find your inner peace with our yoga classes.'),
('Art Gallery1', 10, 'art_gallery_logo.jpg', 'art_gallery_banner.jpg', 4.7, 80, '140 Gallery St', '35.6895', '139.6917', '9900112233', 'info@artgallery.com', 0, '{"Monday": "10:00-18:00", "Tuesday": "10:00-18:00", "Wednesday": "10:00-20:00", "Thursday": "10:00-20:00", "Friday": "10:00-21:00", "Saturday": "11:00-20:00", "Sunday": "11:00-19:00"}', 'Showcasing contemporary and classic art pieces.'),
('Healthy Eats1', 1, 'healthy_eats_logo.jpg', 'healthy_eats_banner.jpg', 4.6, 115, '150 Market Sq', '52.3702', '4.8952', '0011223344', 'order@healthyeats.com', 1, '{"Monday": "10:00-22:00", "Tuesday": "10:00-22:00", "Wednesday": "10:00-22:00", "Thursday": "10:00-22:00", "Friday": "10:00-23:00", "Saturday": "11:00-23:00", "Sunday": "11:00-21:00"}', 'Delicious and nutritious meals for a healthy lifestyle.'),
('Beauty Parlor1', 4, 'beauty_parlor_logo.jpg', 'beauty_parlor_banner.jpg', 4.8, 95, '160 High St', '-33.8688', '151.2093', '1122334455', 'appointments@beautyparlor.com', 0, '{"Monday": "09:00-19:00", "Tuesday": "09:00-19:00", "Wednesday": "09:00-19:00", "Thursday": "09:00-20:00", "Friday": "09:00-20:00", "Saturday": "09:00-18:00", "Sunday": "Closed"}', 'Providing high quality beauty treatments.');


-- tbl_image
INSERT INTO tbl_image (service_provider_id, image) VALUES
(1, 'tasty_bites_1.jpg'), (1, 'tasty_bites_2.jpg'), (2, 'grand_hotel_1.jpg'), (3, 'fitness_first_1.jpg'),
(4, 'hair_studio_1.jpg'), (5, 'music_fest_1.jpg'), (6, 'fashion_store_1.jpg'), (7, 'italian_place_1.jpg'),
(8, 'sunshine_spa_1.jpg'), (9, 'adventure_tours_1.jpg');

-- tbl_service_provider_branches
INSERT INTO tbl_service_provider_branches (main_service_provider_id, branch_service_provider_id) VALUES
(1, 11), (1, 12), (2, 13), (3, 14),
(4, 15), (5, 16), (6, 17), (7, 18),
(8, 19), (9, 20);

-- tbl_vouchers
INSERT INTO tbl_vouchers (service_provider_id, title, description, discount_percentage, discount_amount, expiry_date) VALUES
(1, 'Summer Discount', '10% off all meals', 10.00, NULL, '2024-08-31'),
(2, 'Weekend Special', '20% off room bookings', 20.00, NULL, '2024-07-31'),
(3, 'First Month Free', 'First month membership free', NULL, 50.00, '2024-09-30'),
(4, 'Haircut Deal', '15% off haircuts', 15.00, NULL, '2024-10-31'),
(5, 'Ticket Discount', '5% off ticket purchases', 5.00, NULL, '2024-11-30'),
(6, 'Clothing Sale', '25% off selected items', 25.00, NULL, '2024-12-31'),
(7, 'Pasta Night', '10% off pasta dishes', 10.00, NULL, '2025-01-31'),
(8, 'Spa Package', '15% off spa packages', 15.00, NULL, '2025-02-28'),
(9, 'Tour Discount', '20% off city tours', 20.00, NULL, '2025-03-31'),
(10, 'Museum Entry', 'Free Entry for kids', NULL, 10.00, '2025-04-30');

-- tbl_user_vouchers
INSERT INTO tbl_user_vouchers (user_id, voucher_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

-- tbl_rating
INSERT INTO tbl_rating (user_id, service_provider_id, rating, review) VALUES
(1, 1, 4.5, 'Great food!'), (2, 2, 4.8, 'Excellent service.'),
(3, 3, 4.2, 'Good gym.'), (4, 4, 4.6, 'Nice haircut.'),
(5, 5, 4.9, 'Awesome music!'), (6, 6, 4.3, 'Good clothes.'),
(7, 7, 4.7, 'Delicious pasta.'), (8, 8, 4.9, 'Relaxing spa.'),
(9, 9, 4.6, 'Fun tour.'), (10, 10, 4.4, 'Interesting museum.');

-- tbl_favorites
INSERT INTO tbl_favorites (user_id, service_provider_id, voucher_id, is_voucher) VALUES
(1, 1, NULL, 0), (2, 2, NULL, 0), (3, 3, 3, 1), (4, 4, NULL, 0), (5, 5, 5, 1),
(6, 6, NULL, 0), (7, 7, 7, 1), (8, 8, NULL, 0), (9, 9, 9, 1), (10, 10, NULL, 0);

-- tbl_notification
INSERT INTO tbl_notification (title, content, sender_id, receiver_id, is_read, notification_type) VALUES
('New Discount', '10% off meals at Tasty Bites', 1, 2, 0, 'info'),
('Room Upgrade', 'You have been upgraded to a suite at Grand Hotel', 2, 3, 1, 'info'),
('Gym Closure', 'Fitness First will be closed for maintenance', 3, 4, 0, 'warning'),
('Haircut Reminder', 'Your haircut appointment is tomorrow', 4, 5, 1, 'info'),
('Music Fest Alert', 'Music Fest tickets are selling fast!', 5, 6, 0, 'alert'),
('Clothing Sale', '25% off all clothing items', 6, 7, 1, 'info'),
('Pasta Night', 'Special pasta night at Italian Place', 7, 8, 0, 'info'),
('Spa Day', 'Book your spa day at Sunshine Spa', 8, 9, 1, 'info'),
('Tour Update', 'City tour schedule has been updated', 9, 10, 0, 'info'),
('Museum Event', 'Special event at City Museum this weekend', 10, 1, 1, 'info');





