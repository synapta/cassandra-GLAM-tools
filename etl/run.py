import fcntl
import json
import logging
import time
from datetime import datetime, timedelta

import pymongo

config_file = '../config/config.json'

logging.basicConfig(filename='run.log', level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')


def update(collection, category):
    collection.update_one({'_id': category['_id']}, {
                          '$set': {'lastrun': datetime.utcnow()}})


def process(collection, category):
    print(category['lastrun'])

    if datetime.utcnow() < category['lastrun'] + timedelta(days=1):
        logging.info('No need to run %s', category['name'])
        return

    # do stuff
    update(collection, category)


def main():
    config = json.load(open(config_file))
    client = pymongo.MongoClient(config['mongodb']['url'])
    db = client[config['mongodb']['database']]
    collection = db[config['mongodb']['collection']]

    for category in collection.find():
        if 'lastrun' in category:
            process(collection, category)
        else:
            # first run
            pass


if __name__ == '__main__':
    try:
        lockfile = open('/tmp/cassandra.lock', 'w')
        fcntl.flock(lockfile, fcntl.LOCK_EX | fcntl.LOCK_NB)
        main()
        fcntl.flock(lockfile, fcntl.LOCK_UN)
    except IOError:
        raise SystemExit('Scheduler is already running')
