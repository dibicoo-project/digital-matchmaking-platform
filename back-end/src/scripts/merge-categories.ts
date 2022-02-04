import { Datastore } from '@google-cloud/datastore';
import { Enterprise } from '../enterprises/enterprise.domain';
import { Application } from '../applications/application.domain';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function migrateCompanies(sourceId: string, targetId: string) {
  const datastore = new Datastore();

  const applyChanges = (list: Enterprise[]) => {
    return list
      .map(one => {
        one.categoryIds = one.categoryIds.filter(id => id !== sourceId);
        if (!one.categoryIds.includes(targetId)) {
          one.categoryIds.push(targetId);
        }
        return one;
      })
      .map((data: any) => ({
        key: data[Datastore.KEY],
        data,
        excludeFromIndexes: ['referenceProjects', 'companyProfile', 'keyProjects[].description']
      }))
  };

  const [companies]: [Enterprise[], any] = await datastore.createQuery('enterprise').filter('categoryIds', sourceId).run();
  const [publicCompanies]: [Enterprise[], any] = await datastore.createQuery('public_enterprise').filter('categoryIds', sourceId).run();

  const updates = applyChanges(companies);
  const publicUpdates = applyChanges(publicCompanies);

  console.log(`Migrating companies ${sourceId} => ${targetId}`, updates.length);
  await datastore.update(updates);
  console.log(`Migrating public companies ${sourceId} => ${targetId}`, publicUpdates.length);
  await datastore.update(publicUpdates);
}

async function migrateApplicatons(sourceId: string, targetId: string) {
  const datastore = new Datastore();

  const applyChanges = (list: Application[]) => {
    return list
      .map(one => {
        one.categoryId = targetId;
        return one;
      })
      .map((data: any) => ({
        key: data[Datastore.KEY],
        data,
        excludeFromIndexes: ['description', 'attachments[].description']
      }))
  };

  const [applications]: [Application[], any] = await datastore.createQuery('application').filter('categoryId', sourceId).run();
  const [publicApplications]: [Application[], any] = await datastore.createQuery('public_application').filter('categoryId', sourceId).run();

  const updates = applyChanges(applications);
  const publicUpdates = applyChanges(publicApplications);

  console.log(`Migrating applications ${sourceId} => ${targetId}`, updates.length);
  await datastore.update(updates);
  console.log(`Migrating public applications ${sourceId} => ${targetId}`, publicUpdates.length);
  await datastore.update(publicUpdates);
}

async function renameCategory(id: string, name: string) {
  const datastore = new Datastore();

  const key = datastore.key(['category', datastore.int(id)]);
  const [one] = await datastore.get(key);

  console.log(`Renaming ${one.title} => ${name}`);
  one.title = name;
  await datastore.update(one);
}

async function deleteCategory(id: string) {
  const datastore = new Datastore();
  const key = datastore.key(['category', datastore.int(id)]);
  console.log(`Deleting ${id}`);
  await datastore.delete(key);
}

const wetTarget = '4874813113892864';
const wetSource = '6212000178765824';

const dryTarget = '6313966057816064';
const drySource = '5107844282056704';

localDatastore();
migrateCompanies(wetSource, wetTarget)
  .then(_ => migrateCompanies(drySource, dryTarget))
  .then(_ => migrateApplicatons(wetSource, wetTarget))
  .then(_ => migrateApplicatons(drySource, dryTarget))
  .then(_ => renameCategory(wetTarget, 'Wet digestion'))
  .then(_ => renameCategory(dryTarget, 'Dry digestion'))
  .then(_ => deleteCategory(wetSource))
  .then(_ => deleteCategory(drySource))
  .then();
