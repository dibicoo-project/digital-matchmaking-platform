import { Datastore } from '@google-cloud/datastore';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doUpdate() {
  const datastore = new Datastore();
  const key = datastore.key(['category', 4814094758576128])
  const [one] = await datastore.get(key);

  
  one.parentId = '4894982280314880'; // Services / Technical experts
  one.ancestors = one.ancestors.filter((id: string) => id !== '6302357163868160'); // remove Consultant
  
  console.log(one);
  await datastore.save(one).then(res => {
    console.log('commit', res[0]);
  });
}

localDatastore();
doUpdate().then();
