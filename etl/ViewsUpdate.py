import sys
import os
import bz2
import urllib
import psycopg2 #postgres driver
import json
date=""
conn=None
watched={}
itemN=0
counter=0
AllConnections=[]

def reporter(first,second,third):
    if first%1000==0:
        print "Download progress: "+str(first*second*100/third)+"%"

def process(date):
    global counter
    year, month, day=date.split("-")
    baseurl="https://dumps.wikimedia.org/other/mediacounts/daily/"
    finalurl=baseurl+year+"/"+"mediacounts."+year+"-"+month+"-"+day+".v00.tsv.bz2"
    print ("Retrieving "+finalurl+"...")
    filename,headers=urllib.urlretrieve(finalurl,'temp/temp'+date+'.tsv.bz2',reporter)#!!
    print "Download completed."
    print filename#!!
    source_file = bz2.BZ2File(filename, "r")
    print "Loading visualizations... this may take several minutes"
    i = 0
    curs = []
    while i < len(AllConnections):
        curs.append(AllConnections[i].cursor())
        i += 1
    i = 0
    for line in source_file:
        if counter==itemN:
            print 'Breaked'
            break
        arr = line.split("\t")
        keysX = arr[0].split("/")
        key = keysX[len(keysX) - 1]
        key = urllib.unquote(key).decode('utf8')
        if key in watched:
            counter = counter + 1
            if (counter & 1023)==1:
                print "Loading progress: "+str(counter*100/itemN)+"%"
            query = "select * from dailyinsert('" + key.replace("'", "''") + "','" + date + "'," + arr[2] + "," + arr[22] + "," + arr[23] + ")"
            dbs = watched[key]
            j = 0
            while j < len(dbs):
                curs[dbs[j]].execute(query)
                j += 1
    i = 0
    while i < len(AllConnections):
        curs[i].close()
        i += 1
    source_file.close()
    os.remove(filename)
def loadIn(conn,k):
    global watched
    global itemN
    curse = conn.cursor()
    curse.execute("SELECT img_name FROM images;")
    w = 0
    n=0
    while w < curse.rowcount:
        w += 1
        file = curse.fetchone()
        file = file[0].decode('utf8')
        # print file
        if file not in watched:
            watched[file]=[]
            n+=1
        watched[file].append(k)
    itemN += n
    curse.close()

def init(argdate):
    global cursors
    global date
    global conn
    global AllConnections
    if not os.path.exists("temp"):
        os.makedirs("temp")
    # leggi settings
    categories = json.load(open('../config/config.json'))['categories']
    k = 0
    date = argdate
    print "Script running with following parameters: "+date
    for category in categories:
        connstring="dbname=" + category['connection']['database'] + " user=" + category['connection']['user'] + " password=" + category['connection']['password'] + " host=" + category['connection']['host']
        pgconnection = psycopg2.connect(connstring)
        #print pgconnection.encoding
        pgconnection.autocommit = True
        conn=pgconnection
        loadIn(conn,k)
        AllConnections.append(conn)
        k+=1
    process(date)
    k = 0
    while k < len(AllConnections):
        AllConnections[k].close()
        k+=1
    print "Process completed"

def main():
    #print sys.argv
    if len(sys.argv)==2:
        try:
            init(sys.argv[1])
            sys.exit(0)
        except Exception as e:
            print e
            k = 0
            while k < len(AllConnections):
                AllConnections[k].close()
                k+=1
            sys.exit(1)
    else:
        print "Not enough arguments. See the app documentation"
        sys.exit(2)

if __name__ == "__main__":
    main()
