import fcntl
import json
import logging
import os
import subprocess
import sys
import time
from datetime import date, timedelta
from subprocess import SubprocessError

import psycopg2
import pymongo
from psycopg2 import ProgrammingError

from run import views

config_file = '../config/config.json'
min_date = date(2015, 1, 1)
views_dir = 'temp_fix'

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')


def process_glam(config, glam):
    logging.info('Processing glam %s', glam['name'])

    connstring = "dbname=" + glam['database'] + " user=" + config['postgres']['user'] + \
        " password=" + config['postgres']['password'] + \
        " host=" + config['postgres']['host'] + \
        " port=" + str(config['postgres']['port'])
    conn = psycopg2.connect(connstring)
    conn.autocommit = True
    curse = conn.cursor()
    curse.execute(
        "select distinct access_date from visualizations order by access_date")
    dates = list(map(lambda x: x[0], curse.fetchall()))
    conn.close()

    if len(dates) == 0:
        return

    max_date = dates[len(dates) - 1]
    date_interval = [min_date + timedelta(days=x)
                     for x in range(0, (max_date - min_date).days)]

    glam['missing_dates'] = []

    for date in date_interval:
        if date not in dates:
            glam['missing_dates'].append(date)


def main():
    config = json.load(open(config_file))

    client = pymongo.MongoClient(config['mongodb']['url'])
    db = client[config['mongodb']['database']]
    collection = db[config['mongodb']['collection']]

    glams = []

    for glam in collection.find():
        if 'status' in glam:
            if glam['status'] == 'paused':
                logging.info('Glam %s is paused', glam['name'])
                continue

            if glam['status'] == 'failed':
                logging.info('Glam %s is failed', glam['name'])
                continue

            process_glam(config, glam)
            glams.append(glam)

    max_date = date.today() - timedelta(days=2)
    date_interval = [min_date + timedelta(days=x)
                     for x in range(0, (max_date - min_date).days)]

    # for all dates
    for date_value in date_interval:
        logging.info('Working with date %s', date_value)

        for glam in glams:
            logging.info('Working with GLAM %s', glam['name'])

            if date_value in glam['missing_dates']:
                try:
                    subprocess.run(['python3', 'views.py', glam['name'], date_value.strftime(
                        "%Y-%m-%d"), '--dir', views_dir], check=True)
                except SubprocessError:
                    logging.error('Subprocess views.py failed')

        views_path = os.path.join(
            views_dir, date_value.strftime("%Y-%m-%d") + '.tsv.bz2')
        if os.path.isfile(views_path):
            os.remove(views_path)


if __name__ == '__main__':
    # change the working directory to the script's own directory
    script_dir = os.path.dirname(sys.argv[0])
    if script_dir != '':
        os.chdir(script_dir)

    main()
