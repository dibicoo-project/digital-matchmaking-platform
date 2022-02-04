import { Datastore } from '@google-cloud/datastore';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doUpdate() {
  const datastore = new Datastore();
  const [allFilters] = await datastore.createQuery('enterprise_filters').run();

  const updates = allFilters
    .map((one: any) => ({ objectIds: [...one.enterprises || []], ...one, enterprises: undefined }));

  await datastore.save(updates).then(res => {
    console.log('commit', res[0]);
  });
}

localDatastore();
doUpdate().then();
