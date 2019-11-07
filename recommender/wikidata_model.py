import gzip
import json
import pickle

from gensim import corpora, models, similarities
from tokenizer import tokenize

counter = 0
counter_en = 0
counter_de = 0

id2entity_en = {}
id2entity_de = {}

train_en = []
train_de = []

with gzip.open('wikidata.json.gz', 'rt') as fp_json:

    for line in fp_json:
        if line[0] == '[' or line[0] == ']':
            continue

        line = line.strip()

        if line[-1] == ',':
            line = line[:-1]

        counter += 1

        if counter % 10000 == 0:
            print("Wikidata entity:", counter)

        entity = json.loads(line)

        if 'sitelinks' not in entity:
            continue

        if 'claims' not in entity:
            continue

        if 'labels' not in entity:
            continue

        if 'descriptions' not in entity:
            continue

        if len(entity['sitelinks']) == 0:
            continue

        # instance of
        if 'P31' not in entity['claims']:
            continue

        # disambiguation
        try:
            if entity['claims']['P31'][0]['mainsnak']['datavalue']['value']['id'] == 'Q4167410':
                continue
        except KeyError:
            pass

        try:
            entity_label = entity['labels']['en']['value']
            entity_description = entity['descriptions']['en']['value']
            entity_str = entity_label + " " + entity_description
            train_en.append(entity_str)
            id2entity_en[counter_en] = entity['id']
            counter_en += 1
        except KeyError:
            pass

        try:
            entity_label = entity['labels']['de']['value']
            entity_description = entity['descriptions']['de']['value']
            entity_str = entity_label + " " + entity_description
            train_de.append(entity_str)
            id2entity_de[counter_de] = entity['id']
            counter_de += 1
        except KeyError:
            pass

def save_model(id2entity, train_corpus, name):
    with open(name + '.pkl', 'wb') as fp:
    pickle.dump(id2entity, fp)

    dictionary = corpora.Dictionary(train_corpus)
    dictionary.save(name + '.dict')

    corpus = [dictionary.doc2bow(doc) for doc in train_corpus]
    corpora.MmCorpus.serialize(name + '.mm', corpus)

    model = models.TfidfModel(corpus)
    model.save(name + '.tfidf')

    index = similarities.Similarity(name + '.index', model[corpus], num_features=len(dictionary))
    index.save(name + '.index')

save_model(id2entity_en, train_en, 'en/model')
save_model(id2entity_de, train_de, 'de/model')
