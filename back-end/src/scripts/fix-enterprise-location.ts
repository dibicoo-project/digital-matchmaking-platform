import { Datastore } from '@google-cloud/datastore';
import { Enterprise } from '../enterprises/enterprise.domain';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function updateLocation() {
  const datastore = new Datastore();
  const [allCompanies]: [Enterprise[], any] = await datastore.createQuery('enterprise').run();

  const list = allCompanies
    .filter(c => !c.location)
    .map(c => (
      {
        ...c,
        location: { country: c.country, city: c.city, address: c.street, zipCode: c.zipCode },
        country: undefined,
        city: undefined,
        street: undefined,
        zipCode: undefined
      }
    ))
    .map((data: any) => ({
      key: data[Datastore.KEY],
      data,
      excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
    }));


  console.log('Missing location', list.length);
  const res = await datastore.update(list);
  console.log(res);

  const old = allCompanies
    .filter(c => c.country || c.city || c.street || c.zipCode)
    .map(c => (
      {
        ...c,
        country: undefined,
        city: undefined,
        street: undefined,
        zipCode: undefined
      }
    ))
    .map((data: any) => ({
      key: data[Datastore.KEY],
      data,
      excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
    }));

  console.log('Old addresses', old.length);
  const oldRes = await datastore.update(old);
  console.log(oldRes);
}

localDatastore();
updateLocation().then();
