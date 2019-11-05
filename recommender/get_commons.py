import csv
import json
import langid

import mwclient
import mwparserfromhell
import psycopg2

from unidecode import unidecode

database = 'cassandradb'

with open('../config/config.json', 'r') as fp:
    config = json.load(fp)

conn = psycopg2.connect(host=config['postgres']['host'],
                        port=config['postgres']['port'],
                        dbname=database,
                        user=config['postgres']['user'],
                        password=config['postgres']['password'])

cur = conn.cursor()

cur.execute("""SELECT img_name
                FROM images i
                JOIN usages u ON i.img_name = u.gil_to
                WHERE u.is_alive = TRUE
                GROUP BY img_name""")

images = cur.fetchall()

site = mwclient.Site('commons.wikimedia.org')

with open('commons.csv', mode='w') as fp:
    writer = csv.writer(fp, delimiter='\t')

    for image in images:
        try:
            print(image[0])
            file = site.images[image[0]]
            text = file.text()
            wikicode = mwparserfromhell.parse(text)
            templates = wikicode.filter_templates(matches="{{Information")
            if len(templates) > 0:
                description = templates[0].get("Description").value
                wikicode = mwparserfromhell.parse(description)
                en_templates = wikicode.filter_templates(matches="{{en")
                if len(en_templates) > 0:
                    description = en_templates[0].get("1").value
                description = description.strip_code(keep_template_params=True)
                description = " ".join(description.split())
                description = unidecode(description).lower()
                language = langid.classify(description)
                if len(description) > 0:
                    writer.writerow([image[0], language[0], description])
        except ValueError:
            pass
