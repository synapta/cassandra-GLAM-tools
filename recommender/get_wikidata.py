import csv
import gzip
import json

from unidecode import unidecode

wikidata_counter = 0

with gzip.open('wikidata.json.gz', 'rt') as fp_json:

    with open('wikidata.csv', mode='w') as fp_csv:
        writer = csv.writer(fp_csv, delimiter='\t')

        for line in fp_json:
            if line[0] == '[' or line[0] == ']':
                continue

            line = line.strip()

            if line[-1] == ',':
                line = line[:-1]

            wikidata_counter += 1

            if wikidata_counter % 10000 == 0:
                print("Wikidata entity:", wikidata_counter)

            entity = json.loads(line)

            if 'sitelinks' not in entity:
                continue

            if 'claims' not in entity:
                continue

            if 'labels' not in entity:
                continue

            if 'descriptions' not in entity:
                continue

            # no sitelinks
            if len(entity['sitelinks']) == 0:
                continue

            # no instance of
            if 'P31' not in entity['claims']:
                continue

            # disambiguation
            try:
                if entity['claims']['P31'][0]['mainsnak']['datavalue']['value']['id'] == 'Q4167410':
                    continue
            except KeyError:
                pass

            if 'en' not in entity['labels']:
                continue

            if 'en' not in entity['descriptions']:
                continue

            if 'de' not in entity['labels']:
                continue

            if 'de' not in entity['descriptions']:
                continue

            try:
                entity_label_en = unidecode(entity['labels']['en']['value']).lower()
                entity_description_en = unidecode(entity['descriptions']['en']['value']).lower()
                entity_en = entity_label_en + " " + entity_description_en

                entity_label_de = unidecode(entity['labels']['de']['value']).lower()
                entity_description_de = unidecode(entity['descriptions']['de']['value']).lower()
                entity_de = entity_label_de + " " + entity_description_de

                writer.writerow([entity['title'], entity_en, entity_de])
            except KeyError:
                continue
