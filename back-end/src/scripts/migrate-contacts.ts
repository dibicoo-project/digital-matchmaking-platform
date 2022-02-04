import { Datastore } from '@google-cloud/datastore';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doUpdate() {
  const datastore = new Datastore();
  const query = datastore.createQuery('enterprise');
  const [list] = await datastore.runQuery(query);

  const update = list
    .map(item => {

      const contacts = [
        item.phoneNumber ? { type: 'phone', value: item.phoneNumber } : null,
        item.email ? { type: 'email', value: item.email } : null,
        item.socialMedia ? { type: 'other', value: item.socialMedia } : null
      ].filter(i => i !== null);

      return {
        ...item,
        contacts,
        phoneNumber: undefined,
        email: undefined,
        socialMedia: undefined,
      };
    })
    .map((data: any) => {
      return {
        key: data[Datastore.KEY],
        data,
        // excludeLargeProperties: true, // for fields 1500+ bytes
        excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile']
      };
    });

  // console.dir(update, { depth: null});

  await datastore.save(update).then(res => {
    console.log('commit', res[0]);
  });
}

localDatastore();
doUpdate().then();
