ssh -fN ilario@tools-dev.wmflabs.org -L 3306:itwiki.analytics.db.svc.eqiad.wmflabs:3306
node etl.js
yd=$(date --date="yesterday" '+%Y-%m-%d')
python ViewsUpdate.py $yd
