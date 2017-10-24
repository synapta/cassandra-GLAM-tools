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
import multiprocessing
import psycopg2 #postgres driver
cur=None

def reporter(first,second,third):
    if first%1000==0:
        print "Progress in the download: "+str(first*second*100/third)+"%"

def calculate(arg,watched):
    #print arg
    arr=arg.split("\t")
    keys=arr[0].split(".");
    if len(keys)==2:
        keys=keys[0]
    elif len(keys)==3:
        keys=keys[0]+"."+keys[1]
    else:
        return
    keysX = keys.split("/");
    key=keysX[len(keysX)-1]
    if key in watched:
        print key
        print arr[2]
        print arr[22]
        print arr[23]


def process(date,watchedfilename):
    day, month, year=date.split("/")
    watchedfiles=set(line.strip() for line in open(watchedfilename))
    baseurl="https://dumps.wikimedia.org/other/mediacounts/daily/"
    finalurl=baseurl+year+"/"+"mediacounts."+year+"-"+month+"-"+day+".v00.tsv.bz2"
    print ("Retrieving "+finalurl+"...")
    '''filename,headers=urllib.urlretrieve(finalurl,'temp/temp.tsv.bz2',reporter)'''
    filename="temp/temp.tsv.bz2"
    print "Download completed."
    print filename
    source_file = bz2.BZ2File(filename, "r")
    #pool = multiprocessing.Pool(processes=4)
    #pool.map(calculate, [line for line in source_file])
    for line in source_file:
        calculate(line,watchedfiles)



def main():
    arg="01/01/2017"
    global cur
    pgconnection=psycopg2.connect("dbname=CassandraTEST user=cassandra password=cassandra")
    pgconnection.autocommit=True
    cur=pgconnection.cursor()
    cur.execute("insert into media_index values ('micio',3) ")
    cur.close()
    pgconnection.close()
    process(arg,watchedfilename="test.txt")
    # parse command line options
    '''try:
        opts, args = getopt.getopt(sys.argv[1:], "h", ["help"])
    except getopt.error, msg:
        print msg
        print "for help use --help"
        sys.exit(2)
    # process options
    for o, a in opts:
        if o in ("-h", "--help"):
            print __doc__
            sys.exit(0)
    # process arguments
    for arg in args:
        process(arg) # process() is defined elsewhere'''

if __name__ == "__main__":
    main()