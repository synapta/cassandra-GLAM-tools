'''
CASSANDRA UPDATER STRUCTURE
-- lanciato con argomenti: data

Carica in un hashset i file watched OK
Scarica da internet il corrispondente mediacount archive OK
Comincia a scompattare leggendolo riga per riga finche non terminato
Se la riga e' contenuta nell'hashset, buttalo dentro a pgsql

TODO:
.ci piace la gestione del punto?
.trovare modo per gestire linee in modalita mthread (ci saranno probabilmente da creare piu cursori i guess)
.scrivere chiamata a funzione pgpsql
'''

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
        #print "Died "+self.name
        return

    def calculate(self, arg):
        # print arg
        arr = arg.split("\t")
        keysX = arr[0].split("/");
        key = keysX[len(keysX) - 1]
        # print key
        if key in watched:
            global counter
            counterLock.acquire()
            counter = counter + 1
            counterLock.release()
            print self.name+" Found " + key
            query = "select * from dailyinsert('" + key.replace("'","''") + "','" + date + "'," + arr[2]+","+arr[22]+","+arr[23]+")"
            #print query
            self.cur.execute(query)

    def run(self):
        while not (isOver and q.empty()):
            #print "Waiting "+self.name
            item = q.get()
            if(item=="DIE"):
                break;
            #print "Got "+item
            self.calculate(item)
            #print "Done "+self.name
            q.task_done()
        self.end()
        #print self.name+"Really died"
        return

def reporter(first,second,third):
    if first%1000==0:
        print "Progress in the download: "+str(first*second*100/third)+"%"

def process(date,watchedfilename):
    day, month, year=date.split("/")
    global watched
    watched=set(line.strip() for line in open(watchedfilename))
    baseurl="https://dumps.wikimedia.org/other/mediacounts/daily/"
    finalurl=baseurl+year+"/"+"mediacounts."+year+"-"+month+"-"+day+".v00.tsv.bz2"
    print ("Retrieving "+finalurl+"...")
    filename,headers=urllib.urlretrieve(finalurl,'temp/temp.tsv.bz2',reporter)
    #filename="temp/temp.tsv.bz2"
    print "Download completed."
    print filename
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
        #print counter
        #print len(watched)
        if counter==len(watched):
            doBreak=True
            #print "Killing in the name of!"
        counterLock.release()
        if doBreak:
            break
        #print "Put "+line
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

def init(argdate,argfname):
    global cursors
    global date
    global conn
    pgconnection = psycopg2.connect("dbname=CassandraTEST user=cassandra password=cassandra")
    pgconnection.autocommit = True
    conn=pgconnection
    date = argdate
    print "Script running with following parameters: "
    print date
    print argfname
    process(date, argfname)
    pgconnection.close()
    print "Process ended"

def main():
    # parse command line options
    print sys.argv
    if len(sys.argv)==3:
        init(sys.argv[1],sys.argv[2]);
    else:
        print "Not enough arguments. See the app documentation"
        sys.exit(2)

if __name__ == "__main__":
    main()