create database JsTask_04_04_Empro;
use JsTask_04_04_Empro;

create table tbl_user(
    id bigint(20) primary key auto_increment,
    email varchar(128) not null,
    name varchar(32) not null,
    password text not null,
    token TEXT NOT NULL,
    is_active tinyint default 1,
    is_deleted tinyint default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    deleted_at timestamp null
);

create table tbl_task (
    id bigint(20) primary key auto_increment,
    name varchar(255) not null,
    description text,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    start datetime,
    pause datetime,
    end datetime,
    total_time datetime,
    deadline date,
    is_active tinyint default 1,
    is_deleted tinyint default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    user_id bigint(20) not null,
    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE ON UPDATE CASCADE
); 

