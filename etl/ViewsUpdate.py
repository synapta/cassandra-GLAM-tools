import argparse
import bz2
import json
import os
import sys
import urllib.parse
import urllib.request

import psycopg2  # postgres driver

watched = set()


def reporter(first, second, third):
    if first % 1000 == 0:
        print("Download progress: " + str(first * second * 100 // third) + "%")


def download(date):
    if not os.path.exists("temp"):
        os.makedirs("temp")

    filename = 'temp/' + date + '.tsv.bz2'

    year, month, day = date.split("-")
    baseurl = "https://dumps.wikimedia.org/other/mediacounts/daily/"
    finalurl = baseurl + year + "/mediacounts." + \
        year + "-" + month + "-" + day + ".v00.tsv.bz2"

    # check file size
    if os.path.isfile(filename):
        remote_size = urllib.request.urlopen(finalurl).length
        local_size = os.stat(filename).st_size
        if remote_size == local_size:
            return filename
        else:
            os.remove(filename)

    print("Retrieving " + finalurl + "...")
    urllib.request.urlretrieve(finalurl, filename, reporter)
    print("Download completed.")

    return filename


def process(conn, date):
    filename = download(date)
    print("Loading visualizations from file", filename)

    source_file = bz2.BZ2File(filename, "r")
    curse = conn.cursor()
    counter = 0

    for line in source_file:
        if counter == len(watched):
            break
        arr = line.decode().split("\t")
        keysX = arr[0].split("/")
        key = keysX[len(keysX) - 1]
        key = urllib.parse.unquote(key)
        if key in watched:
            counter += 1
            if counter % 100 == 0:
                print("Loading progress: " +
                      str(counter * 100 // len(watched)) + "%")
            query = "select * from dailyinsert('" + key.replace(
                "'", "''") + "','" + date + "'," + arr[2] + "," + arr[22] + "," + arr[23] + ")"
            curse.execute(query)

    curse.close()
    source_file.close()


def loadImages(conn):
    curse = conn.cursor()
    curse.execute("SELECT img_name FROM images;")
    w = 0
    while w < curse.rowcount:
        w += 1
        file = curse.fetchone()
        file = file[0]
        # print(file)
        if file not in watched:
            watched.add(file)
    curse.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('cat', type=int)
    parser.add_argument('date', type=str)
    args = parser.parse_args()

    # read settings
    try:
        category = json.load(open('../config/config.json')
                             )['categories'][args.cat]
    except IndexError:
        print("Unknown category", args.cat)
        sys.exit(1)

    connstring = "dbname=" + category['connection']['database'] + " user=" + category['connection']['user'] + \
        " password=" + category['connection']['password'] + \
        " host=" + category['connection']['host']
    pgconnection = psycopg2.connect(connstring)
    # print(pgconnection.encoding)
    pgconnection.autocommit = True

    loadImages(pgconnection)
    process(pgconnection, args.date)

    pgconnection.close()
    print("Process completed")


if __name__ == "__main__":
    main()
