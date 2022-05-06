#!/bin/bash

set -e

DAY=`date +"%Y-%m-%d"`
DIR=`mktemp -d`

gsutil -m cp -r "gs://dibicoo-matchmaking-tool-backups/datastore/$DAY" "$DIR"

curl -X POST localhost:8001/v1/projects/dibicoo-matchmaking-tool:import \
  -d "{ \"input_url\":\"${DIR}/${DAY}/${DAY}.overall_export_metadata\" }"
