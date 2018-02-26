create table if not exists dailyImageUsage(img_name varchar(255),count_date date, count bigint, primary key (img_name, count_date));
create or replace function doMaintenance()
returns void as $$
begin
insert into dailyImageUsage(img_name, count_date, count) select gil_to, CURRENT_DATE, count(*) from usages where last_seen=current_date group by gil_to;
update usages set is_alive=false where last_seen<(current_date-5);
end;
$$language plpgsql;
