import csv
import json
import logging
import pickle

import langid
import mwclient
import mwparserfromhell
import psycopg2

from datetime import date
from gensim import corpora, models, similarities
from tokenizer import tokenize

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

cur.execute("""SELECT img_name
                FROM images i
                JOIN usages u ON i.img_name = u.gil_to
                WHERE u.is_alive = TRUE
                GROUP BY img_name""")

images = cur.fetchall()

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
    with open(name + '.pkl','rb') as fp:
        id2entity = pickle.load(fp)
    dictionary = corpora.Dictionary.load(name + '.dict')
    model = models.TfidfModel.load(name + '.tfidf')
    index = similarities.Similarity.load(name + '.index')
    return id2entity, dictionary, model, index

logging.info('Loading English model')
metamodel_en = load_model('en/model')
logging.info('Loading Deutsch model')
metamodel_de = load_model('de/model')

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

for image in images:
    logging.info("Processing image %s", image)

    try:
        language, description = get_description(image[0])

        if description is not None:
            if language == 'de':
                entities, scores = compute_similarity(metamodel_de, image[0] + ' ' + description)
            else:
                entities, scores = compute_similarity(metamodel_en, image[0] + ' ' + description)

            for e in entities:
                cur.execute("""INSERT INTO recommendations
                    (img_name, site, title, url, score, last_update)
                    VALUES(%s, %s, %s, %s, %s, %s)""", (image[0], 'wikidata', e, 'https://www.wikidata.org/wiki/' + e, scores[e], date.today()))

            conn.commit()

    except ValueError:
        pass
