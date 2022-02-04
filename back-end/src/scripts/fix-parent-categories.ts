import { Datastore } from '@google-cloud/datastore';
import { plainId } from '../utils/transform-datastore-id';
import { Enterprise } from '../enterprises/enterprise.domain';
import { Category } from '../categories/category.domain';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function updateCategories() {
  const datastore = new Datastore();

  const [allCategories]: [Category[], any] = await datastore.createQuery('category').run();

  const [draftCompanies]: [Enterprise[], any] = await datastore.createQuery('enterprise').run();
  const [publicCompanies]: [Enterprise[], any] = await datastore.createQuery('public_enterprise').run();

  const updates: any[] = [];

  [...draftCompanies, ...publicCompanies].forEach(comp => {
    const categories = comp.categoryIds
      .map(id => allCategories.find(c => plainId(c) === id))
      .filter(c => !!c)
      .map(c => c!);

    const parentIds = categories.map(c => c.parentId).filter(id => !!id);

    const missingIds = parentIds.filter(id => !comp.categoryIds.includes(id)).filter((val, idx, arr) => arr.indexOf(val) === idx);
    if (missingIds.length > 0) {

      updates.push({
        key: (comp as any)[Datastore.KEY],
        data: {
          ...comp,
          categoryIds: [
            ...comp.categoryIds,
            ...missingIds
          ]
        },
        excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
      });

      // console.log(
      //   comp.companyName,
      //   comp.changedTs,
      //   comp.changedBy,
      //   comp.categoryIds,
      //   missingIds.map(id => allCategories.find(c => plainId(c) === id)!).map(c => ({ id: plainId(c), title: c.title }))
      // );
    }
  });

  console.log('Updating parent categories', updates.length);
  const res = await datastore.update(updates);
  console.log(res);  
}

localDatastore();
updateCategories().then();
