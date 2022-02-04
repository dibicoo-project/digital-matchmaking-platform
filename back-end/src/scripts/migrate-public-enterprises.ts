import { Datastore } from '@google-cloud/datastore';
import { plainId } from '../utils/transform-datastore-id';
import { Enterprise, PublicEnterprise } from '../enterprises/enterprise.domain';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function migrateLogos() {
  const datastore = new Datastore();
  const [allCompanies]: [Enterprise[], any] = await datastore.createQuery('enterprise').run();

  const list = allCompanies
    .filter(c => !!c.logoHash)
    .map(c => (
      {
        ...c,
        logoId: plainId(c),
      }
    )
    )
    .map((data: any) => ({
      key: data[Datastore.KEY],
      data,
      excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
    }));


  console.log('Migrating logos', list.length);
  await datastore.update(list);
}


async function migratePublic() {
  const datastore = new Datastore();
  const [allCompanies]: [PublicEnterprise[], any] = await datastore.createQuery('enterprise').run();

  const pub = allCompanies
    .filter(c => c.status === 'published')
    .map(c => (
      {
        ...c,
        reports: [],
        additionalInformation: undefined,
        latitude: undefined,
        longitude: undefined,
        readyForPublishing: undefined,
        rejectReason: undefined,
        status: undefined,
        pendingReview: undefined,
      }
    )
    )
    .map((data: any) => ({
      key: datastore.key(['public_enterprise', datastore.int(data[Datastore.KEY].id)]),
      data,
      excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
    }));


  console.log('Migrating public companies', pub.length);
  await datastore.upsert(pub);

}

localDatastore();
migrateLogos()
  .then(_ => migratePublic())
  .then();
