The purpose of this project is to support GLAMs in monitoring and evaluating their cooperation with Wikimedia projects. Starting from a Wikimedia Commons category this tool collects data about usage, views, contributors, and topology of the files inside.

The GLAM Statistical Tool "Cassandra" is a project of Wikimedia Switzerland (WMCH) and the result of a long-term collaboration with Swiss cultural institutions expressing their needs for measuring the impact of Wikimedia projects. Together with our GLAM Partner Network, we went through the process of requirement engineering and the respective solution development with our IT-Partner Synapta. Since the first release in 2017, we have thoroughly and continuously enhanced Cassandra to the extraordinary tool it is today.

In keeping the spirit of the Wikimedia movement alive and supporting the mission to make cultural knowledge freely accessible to the world, we aim to share Cassandra for the benefit of other GLAM institutions across the globe. We have already started to implement the strategy of a global roll-out and will foster the implementation in late 2021 and from 2022 onwards.

If you are interested in adopting Cassandra in your country, please contact us at Wikimedia Switzerland.

## Tool architecture

This tool is based on a web application developed with Node.js (`app/`), a dashboarding system ([Metabase](https://www.metabase.com/)), a recommendation script written in Python (`recommender/`), and two ETL pipelines designed to extract file usage statistics and views (`etl/`). Statistical data is stored in a PostgreSQL server (every GLAM is associated with a different database), while GLAM metadata is stored in MongoDB. File usage statistics are obtained from the Wikimedia Commons database replica available on [Toolforge](https://wikitech.wikimedia.org/wiki/Portal:Toolforge). For this reason, an SSH tunnel needs to be created between the server running Cassandra and Toolforge. File views are obtained by downloading and processing the [mediacounts dataset](https://dumps.wikimedia.org/other/mediacounts/daily/). The following diagram summarizes the whole architecture of the tool.

![Cassandra architecture](/docs/architecture.png)

## Requirements

### Hardware requirements

Cassandra should be installed on a server with at least 2 CPUs and 2 GB of RAM, even if 4 GB of RAM are strongly suggested. Disk space usage depends on multiple factors, but you can estimate on average 1 GB per 10k files. For example, for a Wikimedia Commons category with 100k files (or 10 GLAMs with 10k files each), a minimum disk space of 20 GB is suggested (10 GB for the database, 10 GB for Ubuntu, the tool, and temporary files).

### Software requirements

The installation procedure has been tested with Ubuntu 20.04, Node.js 12, Python 3.8, PostgreSQL 12, MongoDB 3.6, and Java 11. The only requirement is to have an empty (and disposable) Ubuntu 20.04 machine, as all the dependencies will be installed automatically. You should be able to login as `root` with SSH to initiate the installation. You should also have an active account on Toolforge configured to accept connections using a passwordless SSH key. Further details on how to obtain it are available in the [Toolforge Quickstart guide](https://wikitech.wikimedia.org/wiki/Portal:Toolforge/Quickstart).

## Installation

The installation procedure has been scripted using the automation tool [Ansible](https://www.ansible.com/). For this reason, you need to first install Ansible on *your* local machine (not on the remote machine where Cassandra will be installed). Please refer to the [Installing Ansible guide](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

On *your* local machine clone this repository:

```
git clone https://github.com/synapta/cassandra-GLAM-tools.git
```

In the `deploy/` directory create an `inventory.ini` file similar to the following, where `host.example.com` is the hostname (or the IP address) of the remote machine:

```
[cassandra]
host.example.com
```

In the `deploy/` directory create an `id_rsa_cassandra` file with the SSH private key configured to login on Toolforge.

Edit the file `deploy/ansible.yml` by setting appropriate values for the following variables:
- *postgres_password*: a password of your choice for PostgreSQL;
- *admin_password*: a password of your choice for the admin user of Cassandra;
- *user_password*: a password of your choice for the non-admin user of Cassandra;
- *wmf_login*: the username associated with your Toolforge account;
- *wmf_user*: the database user associated with your Toolforge account;
- *wmf_password*: the database password associated with your Toolforge account.

Please note that the Toolforge database user and password are available in the file `replica.my.cnf` in your Toolforge home directory.

From the `deploy/` directory, run the Ansible installation script:

```
ansible-playbook ansible.yml -i inventory.ini
```

This script will:
- install the software requirements (e.g. Node.js, PostgreSQL, MongoDB);
- create a passwordless `glam` user;
- download the Cassandra tool;
- install the required Node.js and Python packages;
- setup the PostgreSQL server;
- create an SSH tunnel to Toolforge;
- install and start Metabase;
- enable the periodic runs of the ETL pipelines and the recommender.

The tool will be available on port 8081, while Metabase on port 3000.

Create a Metabase administrator, following the guided procedure available at http://host.example.com:3000 (the host you set in the `inventory.ini` file). You will need to provide your name, surname, email, password, and company. Do not add any data by selecting "I'll add my data later". After Metabase setup is complete, enable the sharing feature: go to Settings (the gear icon), Admin, "Embedding in other Applications" and then select Enable. Take note of the embedding secret key provided by Metabase.

Edit on the remote machine the file `/home/glam/cassandra-GLAM-tools/config/config.json` by setting the Metabase username (the email of the Metabase administrator), the associated password, and the embedding secret key.

After editing the configuration file, it is necessary to restart the tool:

```
supervisorctl restart cassandra
```

It may be necessary to revise the maximum number of categories and files acceptable per GLAM that are provided in the configuration file. Default values are 1k categories and 500k files. If you add a GLAM breaking these limits, it will not be processed and displayed to users.

The Cassandra tool is now available at http://host.example.com:8081. For production use, it is strongly suggested to enable a firewall and to serve the external traffic with an encrypted connection, for example by installing and properly configuring NGINX. The Cassandra tool and Metabase must be associated with different domains. The Metabase URL should be set in the Cassandra configuration file.

## Usage

For the Cassandra main page, select "Control Panel" and login as the user "admin" with the *admin_password* of your choice. To create a new GLAM, select "Add new GLAM". You will need to provide a GLAM ID (this will be the name of the PostgreSQL database), a GLAM full name, the corresponding Wikimedia Commons category, and the URL of an image representing the GLAM.

The pipeline extracting file usage statistics is set to run every 5 minutes. You can check its logs by reading the file `/var/log/cassandra/etl.log`. When this process is completed, the GLAM is ready to be shown to users. However, the list of available GLAMs is updated by the web application every hour. If you don't want to wait, you can manually restart the tool.

The views and the suggestions are still empty at this point because they are populated by two processes that are set to run every night. You can customize the timings by editing the crontab available at `/etc/cron.d/cassandra`. They both write their logs in the directory `/var/log/cassandra`. If you want, you can also run them manually, but be advised that the view pipeline may be slow the first time. The default setting is to load the views of the last 10 days only. If needed, you can edit this value by modifying the GLAM metadata in MongoDB. You will need to create a field *min_date* associated with a string like "2015-01-01".

## Localization

The Cassandra tool can be localized in any language. Currently supported languages are available in the directory `app/locales`. An effective way to add a new language is to commit in this repository the corresponding file using the same format of the *en* language.

For managing translations in a more user-friendly way, it is possible to rely on the [Pontoon tool](https://pontoon.mozilla.org) created by Mozilla Foundation. A public instance of Pontoon for translating Cassandra is available at ...

New users can only be created by an administrator from the interface available at `/a/auth/user/`. A new language can be added by editing the project settings available at `/admin/projects/cassandra-glam-tools/`.

### Pontoon installation

An Ansible script to install Pontoon is available in the `deploy` directory.

In the `deploy/` directory create an `inventory.ini` file similar to the following, where `host.example.com` is the hostname (or the IP address) of the remote machine:

```
[pontoon]
host.example.com
```

This hostname could be the same machine where Cassandra is installed or another machine of your choice. Edit the file `pontoon.yml` and set the *postgres_password*. This will be the password of the PostgreSQL *pontoon* user. Then run the Ansible install script:

```
ansible-playbook pontoon.yml -i inventory.ini
```

Edit the file `/home/glam/pontoon/.env` and update the *SITE_URL* to a real domain. Install and configure nginx to proxy that website to *http://localhost:8000*. You will need to obtain an HTTPS certificate, for example with [Certbot](https://certbot.eff.org/).

Create the first Pontoon administrator in `/home/glam/pontoon`:

```
pipenv run python manage.py createsuperuser
```

Create a new GitHub user and associate it with an SSH key. Give to that user the write permissions on this repository. Save the SSH key in the directory `/home/glam/.ssh`. Finally, restart Pontoon:

```
supervisorctl restart pontoon
```
