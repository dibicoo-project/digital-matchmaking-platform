import { Datastore } from '@google-cloud/datastore';
import { Enterprise } from '../enterprises/enterprise.domain';
import * as fs from 'fs';

function localDatastore() {
  console.log("Using local datastore");
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function exportEnterprises() {
  const datastore = new Datastore();
  const query = datastore.createQuery('public_enterprise')
    .filter('categoryIds', '4874813113892864');
  const [all] = await datastore.runQuery(query);

  const lines: string[] = [];

  all.forEach(one => {
    lines.push(one.companyName);
    
    one.contacts.map(c => {
      return [c.name,
        ...c.elements.filter(e => ['phone', 'email'].includes(e.type)).map(e => e.value)
      ].filter(i => !!i).join('; ')
    })
    .filter(i => !!i)
    .forEach(c => lines.push(`\t${c}`));

    lines.push("")
  });

  
  // console.log(lines);

  fs.writeFileSync('contacts.txt', lines.join('\n'));
  console.log('done')

}

// localDatastore();
exportEnterprises().then();
