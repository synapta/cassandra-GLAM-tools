node etl.js
now=$(date --date="yesterday" '+%d/%m/%Y')
python ViewsUpdate.py $now
