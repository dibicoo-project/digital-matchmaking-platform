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
  const query = datastore.createQuery('enterprise');
  const [all] = await datastore.runQuery(query);

  let headers = '';

  const res = all.map(({ companyName, companyProfile, referenceProjects, keyProjects, categoryIds }: Partial<Enterprise>) => {
    const row = {
      companyName: '"' + companyName + '"',
      companyProfile: '"' + companyProfile + '"',
      referenceProjects: '"' + referenceProjects + '"',
      keyProjects: '"' + keyProjects?.map(p => p.description).join('\t') + '"',
      ad: categoryIds?.includes('5086734652014592'),
      adTurnKey: categoryIds?.includes('6215111412809728'),
      adComponents: categoryIds?.includes('4871364825579520'),
      adServices: categoryIds?.includes('4894982280314880'),
      adMaintenance: categoryIds?.includes('6266351580610560'),
      ga: categoryIds?.includes('4805259675303936'),
      gaTurnKey: categoryIds?.includes('5037343803179008'),
      gaComponents: categoryIds?.includes('6502944618840064'),
      gaServices: categoryIds?.includes('5293577290645504'),
      gaFacilitators: categoryIds?.includes('4527170407890944'),
    };

    headers = Object.keys(row).join(',');
    return Object.values(row).join(',');
  });

  fs.writeFileSync('texts.csv', [headers, ...res].join('\n'));
  console.log('Done')
}

// localDatastore();
exportEnterprises().then();
