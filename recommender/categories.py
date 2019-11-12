import json
import logging
from datetime import date, timedelta

import mwclient
import psycopg2
import requests

database = 'cassandradb'

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')

with open('../config/config.json', 'r') as fp:
    config = json.load(fp)

conn = psycopg2.connect(host=config['postgres']['host'],
                        port=config['postgres']['port'],
                        dbname=database,
                        user=config['postgres']['user'],
                        password=config['postgres']['password'])

cur = conn.cursor()

last_update = date.today() - timedelta(days=7)

cur.execute("""SELECT i.img_name
            FROM images i
            JOIN usages u ON i.img_name = u.gil_to
            LEFT JOIN recommendations r ON i.img_name = r.img_name
            WHERE u.is_alive = TRUE
            AND (r.last_update < %s OR r.last_update IS NULL)
            GROUP BY i.img_name""", (last_update,))

images = cur.fetchall()
image_counter = 0

client = mwclient.Site('commons.wikimedia.org')

for image in images:
    logging.info('Processing image %s of %s: %s', image_counter, len(images), image[0])
    image_counter += 1

    cur.execute("""DELETE FROM recommendations
                WHERE img_name = %s
                AND score IS NULL""", (image[0],))

    entities = []

    page = client.images[image[0]]

    for cat in page.categories(show='!hidden'):
        iwlinks = cat.iwlinks()
        for iw in iwlinks:
            if iw[0] == 'd':
                entities.append(iw[1])

    for e in entities:
        try:
            r = requests.get('http://www.wikidata.org/wiki/Special:EntityData/' + e + '.json')
            entity = r.json()['entities'][e]

            if 'sitelinks' not in entity:
                continue

            if 'claims' not in entity:
                continue

            if len(entity['sitelinks']) == 0:
                continue

            # instance of
            if 'P31' not in entity['claims']:
                continue

            instance_of = entity['claims']['P31'][0]['mainsnak']['datavalue']['value']['id']

            # disambiguation or category        
            if instance_of == 'Q4167410' or instance_of == 'Q4167836':
                continue

        except (ValueError, KeyError):
            continue

        cur.execute("""INSERT INTO recommendations
            (img_name, site, title, url, last_update)
            VALUES(%s, %s, %s, %s, %s)""", (image[0], 'wikidata', e, 'https://www.wikidata.org/wiki/' + e, date.today()))

    conn.commit()
