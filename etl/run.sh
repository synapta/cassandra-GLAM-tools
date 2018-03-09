rm -r temp
ssh -fN ilario@tools-dev.wmflabs.org -L 3306:itwiki.analytics.db.svc.eqiad.wmflabs:3306 -i /home/wikim/.ssh/pk-valdelli.ppk
node etl.js
yd=$(date --date="2 days ago" '+%Y-%m-%d')
python ViewsUpdate.py $yd
if [ $? -eq 1 ]; then sleep 30m; python ViewsUpdate.py $yd; fi
killall ssh
