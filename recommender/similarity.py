import json
import logging
import pickle
import sys
from datetime import date, timedelta

import langid
import mwclient
import mwparserfromhell
import psycopg2
import requests
from psycopg2.errors import UniqueViolation

from gensim import corpora, models, similarities
from tokenizer import tokenize

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
            WHERE (u.is_alive = FALSE OR u.gil_to IS NULL)
            AND (r.last_update < %s OR r.last_update IS NULL)
            GROUP BY i.img_name""", (last_update,))

images = cur.fetchall()
image_counter = 1

site = mwclient.Site('commons.wikimedia.org')


def get_description(image):
    wikipage = site.images[image]
    text = wikipage.text()
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
        language = langid.classify(description)

        if len(description) > 0:
            return language[0], description

    return None, None


def load_model(name):
    with open(name + '.pkl', 'rb') as fp:
        id2entity = pickle.load(fp)
    dictionary = corpora.Dictionary.load(name + '.dict')
    model = models.TfidfModel.load(name + '.tfidf')
    index = similarities.Similarity.load(name + '.index')
    return id2entity, dictionary, model, index


def compute_similarity(metamodel, description):
    id2entity, dictionary, model, index = metamodel

    tokens = tokenize(description)
    vec_bow = dictionary.doc2bow(tokens)
    vec_model = model[vec_bow]
    sims = index[vec_model]
    sims = sorted(enumerate(sims), key=lambda item: -item[1])

    stop_at = 0

    for i, sim in enumerate(sims):
        if sim[1] < 0.4 or i > 10:
            stop_at = i
            break

    sims = sims[:stop_at]

    entities = []
    scores = {}

    for entity in sims:
        id_entity = id2entity[entity[0]]
        entities.append(id_entity)
        scores[id_entity] = entity[1]

    return entities, scores


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


metamodel_en = load_model('en/model')
metamodel_de = load_model('de/model')

for image in images:
    logging.info('Processing image %s of %s: %s', image_counter, len(images), image[0])
    image_counter += 1

    try:
        cur.execute("""DELETE FROM recommendations
                    WHERE img_name = %s""", (image[0],))

        entities = compute_category(image[0])
        process_entities(image[0], entities, None)

        language, description = get_description(image[0])

        if description is not None:
            if language == 'de':
                entities, scores = compute_similarity(metamodel_de, image[0] + ' ' + description)
            else:
                entities, scores = compute_similarity(metamodel_en, image[0] + ' ' + description)

            process_entities(image[0], entities, scores)

    except ValueError:
        continue
