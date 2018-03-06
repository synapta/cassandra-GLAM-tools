create or replace function dailyInsert(text, date,integer, integer, integer)
returns integer as $$
declare id integer;
begin
select media_id into id from images where img_name=$1;
insert into visualizations values(id,$2,$3,$4,$5);
return id;
EXCEPTION   
    WHEN OTHERS THEN RETURN -1;
end;
$$language plpgsql;
