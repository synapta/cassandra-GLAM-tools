create table media_index (media_name varchar(255) primary key, media_id serial unique)
create table media_accesses (media_id int references media_index(media_id), access_date date, accesses bigint, wm_accesses bigint, nwm_accesses bigint)