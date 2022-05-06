import { Datastore } from '@google-cloud/datastore';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doMigrate() {
  const datastore = new Datastore();
  const newParent = '6203627307794432'; // Gas utilisation

  const ids = [
    '6020882187157504', // CHP
    '5437763067314176', // Boiler, burner
    '4673357270220800', // Biogas upgrading systems
  ];

  for (const id of ids) {
    const changes = [];
    const [category] = await datastore.get(datastore.key(['category', Datastore.int(id)]));
    console.log('Migrating', category.title)
    if (category.parentId !== newParent) {
      category.parentId = newParent;
      category.ancestors.push(newParent);
      category.changedBy = 'migrator';
      changes.push(category);
    }

    const [drafts] = await datastore.createQuery('enterprise').filter('categoryIds', category[Datastore.KEY].id).run();
    console.log('drafts', drafts.length);
    drafts.forEach(one => {
      if (!one.categoryIds.includes(newParent)) {
        one.categoryIds.push(newParent);
        one.changedBy = 'migrator';
        changes.push(one);
      }
    });

    const [pub] = await datastore.createQuery('public_enterprise').filter('categoryIds', category[Datastore.KEY].id).run();
    pub.forEach(one => {
      if (!one.categoryIds.includes(newParent)) {
        one.categoryIds.push(newParent);
        one.changedBy = 'migrator';
        changes.push(one);
      }
    });
    console.log('public', pub.length);

    console.log('updating entities', changes.length);

    // throw new Error('Stop');

    const res = await datastore.save(
      changes.map((data: any) => ({
        key: data[Datastore.KEY],
        data,
        excludeFromIndexes: ['additionalInformation', 'referenceProjects', 'companyProfile', 'keyProjects[].description']
      }))
    );
    console.log(res);
  }
}

localDatastore();
doMigrate().then();
