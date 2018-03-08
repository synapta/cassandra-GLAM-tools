sh ./run.sh
now=$(date --date="3 days ago" '+%Y-%m-%d')
echo $now

d=2017-08-28
while [ "$d" != "$now" ]; do
  echo $d
  d=$(date -I -d "$d + 1 day")
  python ViewsUpdate.py $d
done
