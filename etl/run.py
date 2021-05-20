import fcntl
import json
import logging
import os
import subprocess
import sys
import time
from datetime import datetime, timedelta
from subprocess import SubprocessError

import psycopg2
import pymongo
from psycopg2 import ProgrammingError

import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration

config_file = '../config/config.json'

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')


def update(collection, glam):
    collection.update_one({'_id': glam['_id']}, {
                          '$set': {'lastrun': datetime.utcnow(),
                                   'status': 'running'}})


def fail(collection, glam):
    collection.update_one({'_id': glam['_id']}, {
                          '$set': {'status': 'failed'}})


def views_date():
    date = datetime.utcnow() - timedelta(days=1)
    return date.strftime("%Y-%m-%d")


def setup(name):
    logging.info('Running setup.js for %s', name)
    subprocess.run(['node', 'setup.js', name], check=True)
    logging.info('Subprocess setup.js completed')


def dashboard(name):
    logging.info('Running dashboard.py for %s', name)
    subprocess.run(['python3', 'dashboard.py', name], check=True)
    logging.info('Subprocess dashboard.py completed')


def etl(name):
    logging.info('Running etl.js for %s', name)
    subprocess.run(['node', 'etl.js', name], check=True)
    logging.info('Subprocess etl.js completed')


def process_glam(collection, glam):
    if datetime.utcnow() < glam['lastrun'] + timedelta(days=1):
        logging.info('Glam %s is already updated', glam['name'])
        return

    # mediacounts are available around 2:00 UTC
    if datetime.utcnow().hour <= 2:
        logging.info('Glam %s update delayed', glam['name'])
        return

    success = True
    logging.info('Running scheduler for %s', glam['name'])

    # Run etl.js
    try:
        etl(glam['name'])
    except SubprocessError as e:
        success = False
        logging.error('Subprocess etl.js failed')

        if e.returncode == 65:
            logging.error('Glam %s is now failed', glam['name'])
            fail(collection, glam)
            return

    if success:
        logging.info('Completed scheduler for %s', glam['name'])
        update(collection, glam)
    else:
        logging.error('Failed scheduler for %s', glam['name'])


def create_database(config, database):
    connstring = "dbname=template1 user=" + config['postgres']['user'] + \
        " password=" + config['postgres']['password'] + \
        " host=" + config['postgres']['host'] + \
        " port=" + str(config['postgres']['port'])
    conn = psycopg2.connect(connstring)
    conn.autocommit = True
    curse = conn.cursor()
    try:
        curse.execute("CREATE DATABASE " + database + " WITH OWNER = " + config['postgres']['user'] + " " +
                      "ENCODING = 'UTF8' " +
                      "CONNECTION LIMIT = -1 TEMPLATE template0;")
        curse.execute("GRANT CONNECT ON DATABASE " + database + " TO metabase;")
    except ProgrammingError:
        # the database is already available
        pass
    finally:
        conn.close()


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

    for glam in collection.find():
        if 'status' in glam:
            if glam['status'] == 'paused':
                logging.info('Glam %s is paused', glam['name'])
                continue

            if glam['status'] == 'failed':
                logging.info('Glam %s is failed', glam['name'])
                continue

        if 'lastrun' in glam:
            process_glam(collection, glam)
        else:
            # this is the first run
            glam['lastrun'] = datetime.fromtimestamp(0)

            create_database(config, glam['database'])

            try:
                setup(glam['name'])
                #dashboard(glam['name'])
            except SubprocessError:
                logging.error('Subprocess setup.js or dashboard.py failed')
                continue

            process_glam(collection, glam)


if __name__ == '__main__':
    # change the working directory to the script's own directory
    script_dir = os.path.dirname(sys.argv[0])
    if script_dir != '':
        os.chdir(script_dir)

    try:
        lockfile = open('/tmp/cassandra.lock', 'w')
        fcntl.flock(lockfile, fcntl.LOCK_EX | fcntl.LOCK_NB)
        main()
        fcntl.flock(lockfile, fcntl.LOCK_UN)
    except IOError:
        raise SystemExit('Scheduler is already running')
