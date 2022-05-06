# Local environment

* Configure your environment `.env` file
  * Use `.env.example` as a base for it
* Start local datastore emulator (port 8001)
  * `npm run db`
* Start back-end (port 8088)
  * `npm run dev`
* Start front-end (port 4200)
  * `npm start`
* (Optional) Start datastore GUI (port 8000)
  * `back-end/node_modules/.bin/google-cloud-gui`
  * register `dibicoo-matchmaking-tool` project


# Useful commands
* Create indexes in Datastore
  * `gcloud datastore indexes create ~/.config/gcloud/emulators/datastore/WEB-INF/index.yaml`
* Download database backup
  * `gsutil -m cp -r gs://dibicoo-matchmaking-tool-backups/datastore/2022-04-11 /tmp/backup`
* Import data into emulator
  * `curl -X POST localhost:8001/v1/projects/dibicoo-matchmaking-tool:import -d '{ "input_url":"/tmp/backup/2022-04-11/2022-04-11.overall_export_metadata" }'`
* Generate/Update JSON schema files
  * `npm run generateSchema -- -o src/enterprises/schemas/enterpriseBean.json EnterpriseBean`
