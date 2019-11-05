import mwclient
import requests

site = mwclient.Site('commons.wikimedia.org')

page = site.images['Hundert Jahre Bilder aus der Stadt Zürich - Zürich vom Hotel Schwert aus 1835.jpg']

entities = []

for cat in page.categories(show='!hidden'):
    iwlinks = cat.iwlinks()
    for iw in iwlinks:
        if iw[0] == 'd':
            entities.append(iw[1])

print(entities)

for e in entities:
    url = 'https://www.wikidata.org/wiki/Special:EntityData/{}.json'.format(e)
    json = requests.get(url=url).json()

    try:
        entity = json['entities'][e]

        if 'sitelinks' not in entity:
            continue

        if 'claims' not in entity:
            continue

        # no instance of
        if 'P31' not in entity['claims']:
            continue

        # Wikimedia category
        if entity['claims']['P31'][0]['mainsnak']['datavalue']['value']['id'] == 'Q4167836':
            continue

        for sitelink in entity['sitelinks']:
            if sitelink in ['enwiki', 'dewiki']:
                print(entity['sitelinks'][sitelink]['url'])

    except KeyError:
        pass
