#!/bin/bash

gnome-terminal -- bash -c "cd front-end; npm start; exec bash"
gnome-terminal -- bash -cil "cd back-end; npm run dev; exec bash"
gcloud beta emulators datastore start --host-port=localhost:8001
