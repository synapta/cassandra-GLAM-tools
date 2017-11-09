if [ "$(whoami)" != "postgres" ]; then
        echo "Script must be run as user: postgres"
        exit -1
fi
#crea tabella ed utente