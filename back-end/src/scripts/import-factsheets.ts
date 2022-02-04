import { Datastore } from '@google-cloud/datastore';
import * as fs from 'fs';
import * as path from 'path';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doImport(all: any[]) {
  const datastore = new Datastore();

  const [old] = await datastore.createQuery('article')
    .filter('kind', 'factsheet')
    .run();

  await datastore.delete(old.map(one => one[Datastore.KEY]));

  const entities = all.map((item, idx) => {
    return {
      data: {
        ...item,
        id: undefined,
        order: idx,
        prev: idx > 0 ? { id: all[idx - 1].id, name: all[idx - 1].name } : undefined,
        next: idx < all.length - 1 ? { id: all[idx + 1].id, name: all[idx + 1].name } : undefined,
      },
      key: datastore.key(['article', item.id]),
      excludeFromIndexes: ['text']
    };
  });

  await datastore.upsert(entities);
}

async function readFiles(dir: string) {
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const text = fs.readFileSync(path.join(dir, file)).toString();
    return {
      id: file.replace('.md', '').replace(/Factsheet-..-/, '').toLowerCase(),
      name: /# (.+)\n/.exec(text)[1],
      kind: 'factsheet',
      text
    };
  });
}

localDatastore();
readFiles(path.join('data', 'factsheets'))
  .then(doImport)
  .then(() => console.log('Done!'));
