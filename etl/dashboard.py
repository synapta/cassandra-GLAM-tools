import json
import pymongo
import requests
import sys

config_file = '../config/config.json'

config = json.load(open(config_file))

try:
    sys.argv[1]
except IndexError:
    print('Please provide a GLAM')
    sys.exit(1)

mongo_client = pymongo.MongoClient(config['mongodb']['url'])
mongo_db = mongo_client[config['mongodb']['database']]
mongo_collection = mongo_db[config['mongodb']['collection']]

# Find GLAM
glam = mongo_collection.find_one({"name": sys.argv[1]})

if glam is None:
    print('Cannot find GLAM', sys.argv[1])
    sys.exit(1)

# Get Metabase session
r = requests.post(config['metabase']['url'] + '/api/session', json={
    "username": config['metabase']['username'],
    "password": config['metabase']['password']
})
headers = {"X-Metabase-Session": r.json()['id']}

# Create database
database = requests.post(config['metabase']['url'] + '/api/database', headers=headers, json={
    "name": glam['fullname'],
    "engine": "postgres",
    "details": {
        "dbname": glam['database'],
        "host": config['metabase']['database']['host'],
        "port": config['metabase']['database']['port'],
        "user": config['metabase']['database']['user'],
        "password": config['metabase']['database']['password'],
        "ssl": True
    }
})
database_id = database.json()['id']

# Create collection
collection = requests.post(config['metabase']['url'] + '/api/collection', headers=headers, json={
    "name": glam['fullname'],
    "color": "#509EE3"
})
collection_id = collection.json()['id']

# Create dashboard
new_dashboard = requests.post(config['metabase']['url'] + '/api/dashboard', headers=headers, json={
    "name": glam['fullname'],
    "description": None,
    "parameters": [],
    "collection_id": collection_id
})
dashboard_id = new_dashboard.json()['id']

# Get reference dashboard
dashboard = requests.get(
    config['metabase']['url'] + '/api/dashboard/2', headers=headers)

# For all the cards
for card in dashboard.json()['ordered_cards']:

    # Create a new card
    if card['card_id'] is not None:
        old_card = requests.get(
            config['metabase']['url'] + '/api/card/' + str(card['card_id']), headers=headers)

        new_card_dict = old_card.json()
        new_card_dict['dataset_query']['database'] = database_id

        new_card = requests.post(config['metabase']['url'] + '/api/card', headers=headers, json={
            "visualization_settings": new_card_dict['visualization_settings'],
            "collection_id": collection_id,
            "name": new_card_dict['name'],
            "description": new_card_dict['description'],
            "dataset_query": new_card_dict['dataset_query'],
            "display": new_card_dict['display']
        })

        card_id = new_card.json()['id']

    else:
        card_id = None

    # Add card to dashboard
    requests.post(config['metabase']['url'] + '/api/dashboard/' + str(dashboard_id) + '/cards', headers=headers, json={
        "sizeX": card['sizeX'],
        "sizeY": card['sizeY'],
        "row": card['row'],
        "col": card['col'],
        "series": card['series'],
        "parameter_mappings": card['parameter_mappings'],
        "visualization_settings": card['visualization_settings'],
        "cardId": card_id
    })

# Enable embedding
requests.put(config['metabase']['url'] + '/api/dashboard/' + str(dashboard_id), headers=headers, json={
    "enable_embedding": True
})

# Save dashboard_id
mongo_collection.update_one({'_id': glam['_id']}, {
    '$set': {'dashboard_id': dashboard_id}})
