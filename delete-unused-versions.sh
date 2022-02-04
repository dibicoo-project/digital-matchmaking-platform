#!/bin/bash

VERSIONS=`gcloud app versions list --filter='traffic_split: 0' --format='json' | jq -r '. | map(.id) | join(" ")'`

gcloud app versions delete $VERSIONS
