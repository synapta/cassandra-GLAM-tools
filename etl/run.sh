ssh -fN ilario@tools-dev.wmflabs.org -L 3306:itwiki.analytics.db.svc.eqiad.wmflabs:3306 -i /home/wikim/.ssh/pk-valdelli.ppk
node etl.js
yd=$(date --date="yesterday" '+%Y-%m-%d')
python ViewsUpdate.py $yd
