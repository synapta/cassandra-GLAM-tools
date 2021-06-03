import json
import logging
import sys
from datetime import date, timedelta

import mwclient
import psycopg2
import requests
from psycopg2.errors import UniqueViolation

if len(sys.argv) == 1:
    print('Missing database')
    sys.exit(1)

database = sys.argv[1]

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')

with open('../config/config.json', 'r') as fp:
    config = json.load(fp)

conn = psycopg2.connect(host=config['postgres']['host'],
                        port=config['postgres']['port'],
                        dbname=database,
                        user=config['postgres']['user'],
                        password=config['postgres']['password'])

conn.set_session(autocommit=True)

cur = conn.cursor()

last_update = date.today() - timedelta(days=7)

cur.execute("""SELECT i.img_name
            FROM images i
            LEFT JOIN usages u ON i.img_name = u.gil_to
            LEFT JOIN recommendations r ON i.img_name = r.img_name
            WHERE (i.is_alive = TRUE OR i.is_alive IS NULL)
            AND u.is_alive IS NULL
            AND (r.last_update < %s OR r.last_update IS NULL)
            GROUP BY i.img_name""", (last_update,))

images = cur.fetchall()
image_counter = 1

site = mwclient.Site('commons.wikimedia.org')


def compute_category(image):
    entities = []

    page = site.images[image]

    for cat in page.categories(show='!hidden'):
        iwlinks = cat.iwlinks()
        for iw in iwlinks:
            if iw[0] == 'd':
                entities.append(iw[1])

    return entities


def process_entities(image, entities, scores):
    for e in entities:
        try:
            r = requests.get(
                'http://www.wikidata.org/wiki/Special:EntityData/' + e + '.json')
            entity = r.json()['entities'][e]

            if 'sitelinks' not in entity:
                continue

            if 'claims' not in entity:
                continue

            if len(entity['sitelinks']) == 0:
                continue

            if not ('enwiki' in entity['sitelinks'] or 'dewiki' in entity['sitelinks'] or 'frwiki' in entity['sitelinks'] or 'itwiki' in entity['sitelinks']):
                continue

            # instance of
            if 'P31' not in entity['claims']:
                continue

            instance_of = entity['claims']['P31'][0]['mainsnak']['datavalue']['value']['id']

            # disambiguation, category, events, template
            if instance_of in ['Q4167410', 'Q4167836', 'Q18340514', 'Q11119738']:
                continue

        except (ValueError, KeyError):
            continue

        try:
            if scores is not None:
                cur.execute("""INSERT INTO recommendations
                            (img_name, site, title, url, score, last_update)
                            VALUES(%s, %s, %s, %s, %s, %s)""", (image, 'wikidata', e, 'https://www.wikidata.org/wiki/' + e, float(scores[e]), date.today()))
            else:
                cur.execute("""INSERT INTO recommendations
                            (img_name, site, title, url, last_update)
                            VALUES(%s, %s, %s, %s, %s)""", (image, 'wikidata', e, 'https://www.wikidata.org/wiki/' + e, date.today()))
        except UniqueViolation:
            continue


for image in images:
    logging.info('Processing image %s of %s: %s', image_counter, len(images), image[0])
    image_counter += 1

    try:
        cur.execute("""DELETE FROM recommendations
                    WHERE img_name = %s""", (image[0],))

        entities = compute_category(image[0])
        process_entities(image[0], entities, None)

    except ValueError:
        continue
