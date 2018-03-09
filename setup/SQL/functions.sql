create or replace function AddCategory(title varchar(255),subcats int ,files int,_to varchar(255),_level int)
returns void as $$
declare
t varchar(255)[];
l int[];
begin
IF EXISTS (SELECT 1 FROM categories WHERE page_title = title) THEN
update categories set cl_to=cl_to||_to,cat_level=cat_level||_level where page_title=title;
else
t[0]:=_to;
l[0]:=_level;
insert into categories values(title,subcats,files,t,l);
end if;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error on %',title;
end;
$$language plpgsql;

create or replace function AddImage(_name varchar(255),_user varchar(255) ,_timestamp timestamp without time zone,size bigint,_to varchar(255))
returns void as $$
declare
t varchar(255)[];
opened boolean;
begin
SELECT is_alive into opened FROM images WHERE img_name = _name;
t[0]:=_to;
IF FOUND THEN
if opened then
update images set cl_to=cl_to||_to where img_name=_name;
else
update images set cl_to=t, is_alive=true where img_name=_name;
end if;
else
insert into images(img_name,img_user_text,img_timestamp,img_size,cl_to,is_alive) values(_name,_user,_timestamp,size,t,true);
end if;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error on %',_name;
end;
$$language plpgsql;


create or replace function AddUsage(_wiki varchar(20),_page varchar(255) ,_to varchar(255))
returns void as $$
declare
appeared date;
begin
SELECT first_seen into appeared FROM usages WHERE gil_page_title = _page and gil_to=_to and gil_wiki=_wiki and is_alive=true;
IF FOUND THEN
update usages set last_seen=CURRENT_DATE where gil_page_title=_page and gil_to=_to and gil_wiki=_wiki and first_seen=appeared;
else
insert into usages(gil_wiki,gil_page_title,gil_to,first_seen,last_seen,is_alive) values(_wiki,_page,_to,CURRENT_DATE,CURRENT_DATE,true);
end if;
end;
$$language plpgsql;