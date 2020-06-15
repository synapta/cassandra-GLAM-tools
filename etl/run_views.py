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

import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration

config_file = '../config/config.json'

global_min_date = date(2015, 1, 1)
global_max_date = date.today() - timedelta(days=2)
views_dir = 'temp'

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')


def add_missing_dates(config, glam):
    logging.info('Processing glam %s', glam['name'])

    connstring = "dbname=" + glam['database'] + " user=" + config['postgres']['user'] + \
        " password=" + config['postgres']['password'] + \
        " host=" + config['postgres']['host'] + \
        " port=" + str(config['postgres']['port'])
    conn = psycopg2.connect(connstring)
    conn.autocommit = True
    curse = conn.cursor()

    # Find the dates already in the database
    curse.execute(
        "select distinct access_date from visualizations order by access_date")
    current_dates = list(map(lambda x: x[0], curse.fetchall()))

    # Find the date of the first image, if any
    curse.execute("SELECT min(img_timestamp) FROM images")
    try:
        first_image = curse.fetchone()[0].date()
    except TypeError:
        first_image = global_min_date
    conn.close()

    min_date = max([first_image, global_min_date])
    # BUL glam has some early days with zero views
    if glam['name'] == 'BUL':
        min_date = date(2016, 1, 1)
    candidate_dates = [min_date + timedelta(days=x)
                       for x in range(0, (global_max_date - min_date).days)]

    glam['missing_dates'] = []

    for date_value in candidate_dates:
        if date_value not in current_dates:
            glam['missing_dates'].append(date_value)


def main():
    config = json.load(open(config_file))

    try:
        sentry_logging = LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        )
        sentry_sdk.init(
            dsn=config['raven']['glamtoolsetl']['DSN'],
            integrations=[sentry_logging]
        )
        logging.info('External error reporting ENABLED')
    except KeyError:
        logging.info('External error reporting DISABLED')

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

            add_missing_dates(config, glam)
            glams.append(glam)

    date_interval = [global_min_date + timedelta(days=x)
                     for x in range(0, (global_max_date - global_min_date).days)]

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

    try:
        lockfile = open('/tmp/cassandra_views.lock', 'w')
        fcntl.flock(lockfile, fcntl.LOCK_EX | fcntl.LOCK_NB)
        main()
        fcntl.flock(lockfile, fcntl.LOCK_UN)
    except IOError:
        raise SystemExit('Views is already running')
