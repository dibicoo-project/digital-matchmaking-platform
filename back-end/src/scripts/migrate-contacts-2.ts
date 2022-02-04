import { Datastore } from '@google-cloud/datastore';

function localDatastore() {
  console.log("Using local datastore");
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

function mapContacts(item: any) {  
  const contacts = [
    {
      name: item.contactName,
      elements: item.contacts
    }
  ];

  return {
    ...item,
    contacts,
    contactName: undefined
  };
}

async function updateEnterprises() {
  const datastore = new Datastore();
  const query = datastore.createQuery('enterprise');
  const [list] = await datastore.runQuery(query);

  const update = list
    .filter(item => !!item.contacts && item.contacts.find(c => !!c.value))
    .map(item => mapContacts(item))
    .map((data: any) => {
      return {
        key: data[Datastore.KEY],
        data,
        // excludeLargeProperties: true, // for fields 1500+ bytes
        excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile']
      };
    });

  // console.dir(update.map(one => ({ key: one.key, contacts: one.data.contacts}) ), { depth: null });

  console.log('=== Enterprises');
  await datastore.save(update).then(res => {
    console.log('commit', res[0]);
  });
}

async function updateApplications() {
  const datastore = new Datastore();
  const query = datastore.createQuery('application');
  const [list] = await datastore.runQuery(query);

  const update = list
    .filter(item => !!item.contacts && item.contacts.find(c => !!c.value))
    .map(item => mapContacts(item))
    .map((data: any) => {
      return {
        key: data[Datastore.KEY],
        data,
        // excludeLargeProperties: true, // for fields 1500+ bytes
        excludeFromIndexes: ['description', 'feedstockDescription', 'utilization']
      };
    });

  // console.dir(update.map(one => ({ key: one.key, contacts: one.data.contacts}) ), { depth: null });
  // console.dir(update, { depth: null });
  
  console.log('=== Applications');
  await datastore.save(update).then(res => {
    console.log('commit', res[0]);
  });
}

localDatastore();
updateEnterprises().then();
updateApplications().then();
