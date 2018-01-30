node etl.js
now=$(date --date="yesterday" '+%Y-%m-%d')
python ViewsUpdate.py $now
