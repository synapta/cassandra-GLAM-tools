import sys
import getopt
import bz2
import urllib
import threading
import Queue
import psycopg2 #postgres driver
date=""
conn=None
watched=None
BUF_SIZE = 200
NTHREADS=5
itemN=0
q = Queue.Queue(BUF_SIZE)
isOver=False
counter=0
counterLock=threading.Lock()

class ConsumerThread(threading.Thread):
    def __init__(self, group=None, target=None, name=None,
                 args=(), kwargs=None, verbose=None):
        super(ConsumerThread,self).__init__()
        self.target = target
        self.name = name
        self.cur=conn.cursor()
        return

    def end(self):
        self.cur.close()
        return

    def calculate(self, arg):
        arr = arg.split("\t")
        keysX = arr[0].split("/");
        key = keysX[len(keysX) - 1]
        key=urllib.unquote(key).decode('utf8')
        if key in watched:
            global counter
            counterLock.acquire()
            counter = counter + 1
            counterLock.release()
            print "Found " + key+" (Thread "+self.name+", n. "+str(counter)+" of "+str(itemN)+" )"
            query = "select * from dailyinsert('" + key.replace("'","''") + "','" + date + "'," + arr[2]+","+arr[22]+","+arr[23]+")"
            self.cur.execute(query)

    def run(self):
        while not (isOver and q.empty()):
            item = q.get()
            if(item=="DIE"):
                break;
            self.calculate(item)
            q.task_done()
        self.end()
        return

def reporter(first,second,third):
    if first%1000==0:
        print "Progress in the download: "+str(first*second*100/third)+"%"

def process(date):
    day, month, year=date.split("/")
    global watched
    watched = set()
    curse=conn.cursor();
    curse.execute("SELECT img_name FROM images;")
    w=0
    while w<curse.rowcount:
        w+=1
        file=curse.fetchone()
        file=file[0].decode('utf8')
        #print file
        watched.add(file)
    global itemN
    itemN=w
    curse.close()
    baseurl="https://dumps.wikimedia.org/other/mediacounts/daily/"
    finalurl=baseurl+year+"/"+"mediacounts."+year+"-"+month+"-"+day+".v00.tsv.bz2"
    print ("Retrieving "+finalurl+"...")
    filename,headers=urllib.urlretrieve(finalurl,'temp/temp.tsv.bz2',reporter)#!!
    print "Download completed."
    print filename#!!
    source_file = bz2.BZ2File(filename, "r")
    print "Loading visualizations... this may take several minutes"
    #crea thread
    threads=[]
    i=0
    while i<NTHREADS:
        c=ConsumerThread(name=str(i))
        threads.append(c)
        c.start()
        i=i+1
    for line in source_file:
        counterLock.acquire()
        doBreak=False
        if counter==len(watched):
            doBreak=True
        counterLock.release()
        if doBreak:
            break
        q.put(line)
    i=0
    global isOver
    isOver=True
    q.join()
    i=0
    while i<NTHREADS:
        q.put("DIE") #sporchissimo, ma sembra non esserci altro modo
        i=i+1
    i=0
    while i<NTHREADS:
        threads[i].join()
        i=i+1

def init(argdate):
    global cursors
    global date
    global conn
    pgconnection = psycopg2.connect("dbname=cassandradb user=cassandra password=cassandra")
    #print pgconnection.encoding
    pgconnection.autocommit = True
    conn=pgconnection
    date = argdate
    print "Script running with following parameters: "+date
    process(date)
    pgconnection.close()
    print "Process ended"

def main():
    #print sys.argv
    if len(sys.argv)==2:
        init(sys.argv[1]);
    else:
        print "Not enough arguments. See the app documentation"
        sys.exit(2)

if __name__ == "__main__":
    main()