import json
import logging
from datetime import date

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

logging.info("reading the images from the database")

cur.execute("""SELECT img_name
                FROM images i
                JOIN usages u ON i.img_name = u.gil_to
                WHERE u.is_alive = TRUE
                GROUP BY img_name""")

images = cur.fetchall()
image_counter = 0

client = mwclient.Site('commons.wikimedia.org')

for image in images:
    entities = []
    
    if image_counter % 100 == 0:
        logging.info('working with image %s of %s', image_counter, len(images))
    image_counter += 1

    page = client.images[image[0]]

    for cat in page.categories(show='!hidden'):
        iwlinks = cat.iwlinks()
        for iw in iwlinks:
            if iw[0] == 'd':
                entities.append(iw[1])

    for e in entities:
        url = 'https://www.wikidata.org/wiki/Special:EntityData/{}.json'.format(e)
        json = requests.get(url=url).json()

        try:
            entity = json['entities'][e]

            if 'sitelinks' not in entity:
                continue

            if 'claims' not in entity:
                continue

            # instance of
            if 'P31' not in entity['claims']:
                continue

            # Wikimedia category
            if entity['claims']['P31'][0]['mainsnak']['datavalue']['value']['id'] == 'Q4167836':
                continue

            cur.execute("""INSERT INTO recommendations
                (img_name, site, title, url, score, last_update)
                VALUES(%s, %s, %s, %s, %s, %s)""", (image[0], 'wikidata', e, 'https://www.wikidata.org/wiki/' + e, 1, date.today()))

            # for site in entity['sitelinks']:
            #     if site in ['enwiki', 'dewiki', 'frwiki', 'itwiki']:
            #         sitelink = entity['sitelinks'][site]
            #         cur.execute("""INSERT INTO recommendations
            #                         (img_name, site, title, url, score, last_update)
            #                         VALUES(%s, %s, %s, %s, %s, %s)""", (image[0], sitelink['site'], sitelink['title'], sitelink['url'], 1, date.today()))

        except KeyError:
            pass

    conn.commit()
