#now=$(date --date="yesterday" '+%d/%m/%Y')
#python ViewsUpdate.py 02/01/2017

d=2017-08-28
while [ "$d" != 2017-08-30 ]; do
  echo $d
  d=$(date -I -d "$d + 1 day")
  python ViewsUpdate.py $d
done
