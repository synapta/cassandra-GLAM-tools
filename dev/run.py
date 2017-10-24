'''
CASSANDRA UPDATER STRUCTURE
-- lanciato con argomenti: data

Carica in un hashset i file watched OK
Scarica da internet il corrispondente mediacount archive
Comincia a scompattare leggendolo riga per riga finche non terminato
Se la riga e' contenuta nell'hashset, buttalo dentro a pgsql
'''

import sys
import getopt
import bz2
import urllib
def reporter(first,second,third):
    if first%1000==0:
        print "Progress in the download: "+str(first*second*100/third)+"%"

def process(date,watchedfilename):
    day, month, year=date.split("/")
    watchedfiles=set(line.strip() for line in open(watchedfilename))
    baseurl="https://dumps.wikimedia.org/other/mediacounts/daily/"
    finalurl=baseurl+year+"/"+"mediacounts."+year+"-"+month+"-"+day+".v00.tsv.bz2"
    print ("Retrieving "+finalurl+"...")
    '''filename,headers=urllib.urlretrieve(finalurl,'temp.tsv.bz2',reporter)'''
    filename='temp.tsv.bz2'
    print "Download completed."
    source_file = bz2.BZ2File(filename, "r")
    for line in source_file:
        print line.strip()


def main():
    arg="01/01/2017"
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