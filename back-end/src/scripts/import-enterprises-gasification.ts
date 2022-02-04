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

  // list of other categories
  // const flat = [].concat(...list.map(one => one.otherCategories));
  // console.log([... new Set(flat)]);

  const [allCategories] = await datastore.createQuery('category').run();
  const missingCategories: string[] = [];

  const toCategoryIds = (name: string) => {
    const cat = allCategories.find(rec => rec.title === name
      && rec.importKey && rec.importKey.startsWith('gas'));
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
        otherCategories: undefined, // not importing yet
        categoryIds: [].concat(...item.categories.map(toCategoryIds).filter(v => !!v)),
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
          'Turnkey system provider',
          'Component producer',
          'Services / Technical experts',
          'Facilitators',

          'Fixed bed gasifier',
          'Fluidised bed gasifier',
          'Entrained flow gasifier',
          'Hydrothermal gasification',
          'Feedstock, wood pellets',
          'Feedstock, mixed biomass pellets',
          'Feedstock, wood chips',
          'Feedstock, other',
          'Size, up to 100 kWe',
          'Size, between 100 and 1000 kWe',
          'Size, above 1 MWe',

          'Storage system',
          'Feedstock conveying system',
          'Pretreatment system (shredding, drying, etc)',
          'Gasifier, fixed bed',
          'Gasifier, fluidised bed',
          'Blowers',
          'Gasifier, entrained flow gasifyer',
          'Hydrothermal Gasifer',
          'Safety equipment',
          'Measurement, control and regulation (MCR) techniques',
          'Gas analysis',
          'Biogas use, CHP',
          'Biogas use, boiler/burner',
          'Biogas upgrading systems',
          'Biogas use, conversion to liquid biofuel',
          'Charcoal treatment',
          'Charcoal use',
          'Other components',

          'Project developer',
          'Planning',
          'Consultant',
          'Maintenance provider',
          'Environment',
          'Safety',
          'Electricity',
          'Other services',

          'Political institutions',
          'Biogas and RE associations',
          'Research institutions',
          'Development organisations',
          'Trade chambers',
          'Other facilitators',

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
        categories: ['Gasification', ...categories, ...otherCategories]
      } as any);
      /* tslint:enable */
    });

  await new Promise(resolve => {
    stream.on('end', () => resolve());
  });
  return all;
}

localDatastore();
loadCsv('data/enterprises-gasification.csv')
  .then(doImport)
  .then();
