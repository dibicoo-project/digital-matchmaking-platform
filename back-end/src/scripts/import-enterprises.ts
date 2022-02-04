/*
* TODO: before exporting to CSV, fix following:
*   - Rename "GPS data" columns
*       - GPS data 1
*       - GPS data 2
*   - Rename "Other, please specify" columns to appropriate group:
*       - Other component
*       - Other services
*       - Other maintenance
*       - Other facilitators
*   - Rename "CHP" to appropriate groups
*       - CHP component
*       - CHP maintenace
*/

import { Datastore } from '@google-cloud/datastore';
import { Enterprise, Contact } from '../enterprises/enterprise.domain';
import * as fs from 'fs';
import parse from 'csv-parse';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doImport(list: Enterprise[]) {
  const datastore = new Datastore();

  const [allCategories] = await datastore.createQuery('category').run();
  const missingCategories: string[] = [];

  const toCategoryId = (name: string) => {
    const cat = allCategories.find(rec => rec.title === name
      && rec.importKey && rec.importKey.startsWith('ad'));
    if (!cat) {
      missingCategories.push(name);
      return null;
    } else {
      return cat[Datastore.KEY].id;
    }
  };

  const [allEnterprises] = await datastore.createQuery('enterprise').run();

  const upsert = list
    .map((item: any) => {
      return {
        ...item,
        categories: undefined, // remove string[] categories
        categoryIds: [].concat(...item.categories.map(toCategoryId).filter(v => !!v)),
        changedTs: new Date(),
        changedBy: 'imported', // for easy deleting :)
        owners: [
          'google-oauth2|109503744650507422207', // Vitalijs
          'google-oauth2|117418642939553146876', // Kristina
          'google-oauth2|115457889803621453309', // Aleksejs
        ],
        status: 'published',
        readyForPublishing: true,
        webPage: !/^http[s]?:\/\//.test(item.webPage) ? 'http://' + item.webPage : item.webPage
      };
    })
    .map(data => {
      const old = allEnterprises.find(e => e.companyName === data.companyName);
      return {
        key: old ? old[Datastore.KEY] : datastore.key('enterprise'),
        data: { ...old, ...data },
        excludeFromIndexes: ['companyProfile', 'referenceProjects', 'additionalInformation']
      };
    });

  const existing = upsert
    .map(u => u.key.id)
    .filter(id => !!id);

  const duplcates = existing
    .filter((id, idx) => existing.findIndex(a => a === id) !== idx);

  if (duplcates.length > 0) {
    console.error('Found duplicate company names, importing LAST record only!');
    console.error(duplcates.map(dup => upsert.find(item => item.key.id === dup).data.companyName));
    duplcates.forEach(dup => {
      const idx = upsert.findIndex(u => u.key.id === dup);
      upsert.splice(idx, 1);
    });
  }


  if (missingCategories.length > 0) {
    console.log('Missing categories');
    console.log([...new Set(missingCategories)]);
    throw new Error('Missing categories');
  }

  const [res] = await datastore.upsert(upsert);
  console.log(`Upserted ${res.mutationResults.length} records.`);
}

async function loadCsv(file: string) {
  const parser = parse({ delimiter: ',', from_line: 2, columns: true });
  const all: Array<Partial<Enterprise>> = [];

  const stream = fs.createReadStream(file)
    .pipe(parser)
    .on('data', row => {
      const categories: string[] =
        [
          // global categories
          'Turnkey project provider', 'Component producer', 'Services / Technical experts', 'Maintenance provider',
          'Sonstiges (bitte angeben)',

          // turnkey project provider
          'Wet digestion, CSTR', 'Wet digestion, plug flow', 'Dry digestion, batch', 'Dry digestion, plug flow',
          'Lagoon biogas systems', 'Household Biogas systems',

          // component producer
          'Feeding system', 'Pretreatment systems', 'Sanitisation devices', 'Digester, tanks', 'Pumps',
          'Pipes, valves, etc.', 'Blowers', 'Safety techniques, such as flare, failsafe device, etc.',
          'Measurement, control and regulation (MCR) techniques', 'Gas analysis', 'CHP component', 'Biogas boiler/burner',
          'Biogas upgrading systems', 'Gas analysis', 'Digestate treatment and use', 'Digesting additives',
          'Other additives', 'Storage, for feedstock or output material',

          // services
          'Project developer', 'Planning', 'Consultant', 'Environment', 'Biology', 'Safety', 'Electricity',

          // maintenace
          'Complete biogas plant', 'CHP maintenance',

          // // faciliators
          // 'Political institutions', 'Biogas and RE associations', 'Research institutions',
          // 'Development organisations', 'Trade chambers'
        ].filter(cat => row[cat] === cat);

      const otherCategories: string[] =
        [
          'Other components',
          'Other services',
          'Other maintenance'
        ].filter(cat => !!row[cat]);
      // .map(cat => cat + ': ' + row[cat]);

      const contacts: Contact[] = [
        { type: 'email', value: row['E-mail adress'] },
        { type: 'phone', value: row['Phone number (including country number)'] },
        { type: 'other', value: row['Social media contact'] },
      ].filter(con => !!con.value);

      /* tslint:disable:no-string-literal */
      all.push({
        companyName: row['Name of the company'],
        companyProfile: row['Short company profile'],
        country: row['Country'],
        city: row['City'],
        zipCode: row['ZIP code'],
        street: row['Street and house number'],
        webPage: row['Website'],
        // gps: row['GPS data 1'],
        referenceProjects: row['Reference projects, maximum 2000 characters'],
        additionalInformation: row['Additional information'],
        contacts,
        categories: ['Anaerobic Digestion', ...categories, ...otherCategories]
      } as any);
      /* tslint:enable */
    });

  await new Promise(resolve => {
    stream.on('end', () => resolve());
  });
  return all;
}

localDatastore();
loadCsv('data/enterprises.csv')
  .then(doImport)
  .then();
