create table IF NOT EXISTS media_index (media_name varchar(255) primary key, media_id serial unique);
create table IF NOT EXISTS media_accesses (media_id int references media_index(media_id), access_date date, accesses bigint, wm_accesses bigint, nwm_accesses bigint, primary key(media_id,access_date));
create table IF NOT EXISTS categories (page_title varchar(255) primary key, cat_subcats int, cat_files int, cl_to varchar(255), cat_level int);
