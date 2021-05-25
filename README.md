The purpose of this project is to support GLAMs in monitoring and evaluating their cooperation with Wikimedia projects. Starting from a Wikimedia Commons category this tool collects data about usage, views, contributors and topology of the files inside.

The GLAM Statistical Tool "Cassandra" is a project of Wikimedia Switzerland (WMCH) and the result of a long-term collaboration with Swiss cultural institutions expressing their needs for measuring the impact of Wikimedia projects. Together with our GLAM Partner Network we went through the process of requirement engineering and the respective solution development with our IT-Partner Synapta. Since the first release in 2017, we have thoroughly and continuously enhanced Cassandra to the extraordinary tool it is today.

In keeping the spirit of the Wikimedia movement alive and supporting the mission to make cultural knowledge freely accessible to the world, we aim to share Cassandra for the benefit of other GLAM institutions across the globe. We have already started to implement the strategy of a global roll-out and will foster the implementation in late 2021 and from 2022 onwards.

If you are interested in adopting Cassandra in your country, please contact us at Wikimedia Switzerland.

## Tool architecture

This tool is based on a web application developed with Node.js (`app/`), a dashboarding system ([Metabase](https://www.metabase.com/)), a recommendation script written in Python (`recommender/`), and two ETL pipelines designed to extract file usage statistics and views (`etl/`). Statistical data is stored in a PostgreSQL server (every GLAM is associated with a different database), while GLAM metadata is stored in MongoDB. File usage statistics are obtained from the Wikimedia Commons database replica available on [Toolforge](https://wikitech.wikimedia.org/wiki/Portal:Toolforge). For this reason an SSH tunnel needs to be created between the server running Cassandra and Toolforge. File views are obtained by downloading and processing the [mediacounts dataset](https://dumps.wikimedia.org/other/mediacounts/daily/).

## Requirements

### Hardware requirements

### Software requirements

The installation procedure has been tested with Ubuntu 20.04, Node.js 12, Python 3.8, PostgreSQL 12, MongoDB 3.6, and Java 11. The only requirement is to have an empty (and disposable) Ubuntu 20.04 machine, as all the dependeces will be installed automatically. You should to able to login as `root` with SSH to initiate the installation. You should also have an active account on Toolforge configured to accept connections using a passwordless SSH key. Further details on how to obtain it are available in the [Toolforge Quickstart guide](https://wikitech.wikimedia.org/wiki/Portal:Toolforge/Quickstart).

## Installation

The installation procedure has been scripted using the automation tool [Ansible](https://www.ansible.com/). For this reason you need to first install Ansible on *your* local machine (not on the remote machine were Cassandra will be installed). Please refer to the [Installing Ansible guide](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

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

Edit the file `deploy/ansible.yml` by setting approriate values for the following variables:
- postgres_password: a password of your choice for PostgreSQL;
- admin_password: a password of your choice for the admin user of Cassandra;
- user_password: a password of your choice for the non-admin user of Cassandra;
- wmf_login: the username associated with your Toolforge account;
- wmf_user: the database user associated with your Toolforge account;
- wmf_password: the database password associated with your Toolforge account.

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

Create a Metabase administrator, following the guided procedure available at http://host.example.com:3000 (the host you set in the `inventory.ini` file). Edit on the remote machine the file `/home/glam/cassandra-GLAM-tools/config/config.json` by setting the Metabase username (the email of the Metabase administrator) and the associated password.

On Metabase enable the sharing feature and copy the secret key provided by Metabase in the Cassandra configuration file. To enable the sharing feature...

The Cassandra tool is now available at http://host.example.com:8081. For production use, it is strongly suggested to enable a firewall and to serve the external traffic with an encrypted connection, for example by install and properly configuring nginx. The Cassandra tool and Metabase must be associated with different domains. The Metabase URL should be set in the Cassandra configuration file.
