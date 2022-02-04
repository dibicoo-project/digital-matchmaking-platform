import { Datastore } from '@google-cloud/datastore';
import axios from 'axios';
import { Enterprise } from '../enterprises/enterprise.domain';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function updateLocation() {

  const countries: any[] = (
    await axios.get(
      'https://restcountries.eu/rest/v2/all',
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  ).data;

  const datastore = new Datastore();
  const [allCompanies]: [Enterprise[], any] = await datastore.createQuery('enterprise').run();

  const list = allCompanies
    .filter(c => (c.keyProjects || []).length > 0)
    .map(c => {
      const keyProjects = c.keyProjects?.map(p => {
        return {
          ...p,
          location: { country: p.country },
          latlng: countries.find(c => c.name === p.country)?.latlng,
          country: undefined
        }
      });

      return {
        ...c,
        keyProjects
      }
    })
    .map((data: any) => ({
      key: data[Datastore.KEY],
      data,
      excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
    }));


  console.log('Updating location', list.length);
  const res = await datastore.update(list);
  console.log(res);
}

localDatastore();
updateLocation().then();
