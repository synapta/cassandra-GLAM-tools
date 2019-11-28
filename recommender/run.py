import fcntl
import json
import logging
import os
import subprocess
import sys
from subprocess import SubprocessError

import pymongo
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration

config_file = '../config/config.json'

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')


def run_recommender(glam):
    logging.info('Running recommender for %s', glam['name'])

    try:
        subprocess.run(['python3', 'similarity.py', glam['database']], check=True)
    except SubprocessError:
        logging.error('Subprocess similarity.py failed')


def main():
    config = json.load(open(config_file))

    try:
        logging.info('External error reporting enabled')

        sentry_logging = LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        )
        sentry_sdk.init(
            dsn=config['raven']['glamtoolsetl']['DSN'],
            integrations=[sentry_logging]
        )
    except KeyError:
        logging.info('External error reporting DISABLED')
        pass

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

            run_recommender(glam)


if __name__ == '__main__':
    # change the working directory to the script's own directory
    script_dir = os.path.dirname(sys.argv[0])
    if script_dir != '':
        os.chdir(script_dir)

    try:
        lockfile = open('/tmp/cassandra_recommender.lock', 'w')
        fcntl.flock(lockfile, fcntl.LOCK_EX | fcntl.LOCK_NB)
        main()
        fcntl.flock(lockfile, fcntl.LOCK_UN)
    except IOError:
        raise SystemExit('Recommender is already running')
