import { Datastore } from '@google-cloud/datastore';
import { Enterprise } from '../enterprises/enterprise.domain';
import * as fs from 'fs';
import parse from 'csv-parse';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

async function doWork(list: any[]) {
  const datastore = new Datastore();
  let [allCategories] = await datastore.createQuery('category').run();
  allCategories = allCategories.filter(c => c.importKey.startsWith('ad'));
  const [allCompanies] = await datastore.createQuery('enterprise').run();


  const missingCategories = new Set()

  // console.log(allCategories);
  // throw new Error();

  list.forEach(row => {
    const name = row['Name of the company'];
    const actualCategories = Object.keys(row).filter(key => key !== 'Name of the company');
    const missing = actualCategories.filter(key => allCategories.findIndex(cat => cat.title === key) < 0);

    if (missing.length > 0) {
      console.log('Missing category', name, missing);
    } else {
      const company = allCompanies.find(c => c.companyName === name);

      if (!company) {
        console.log('Company not found in DB', name);
      } else {
        const dbCategories = company.categoryIds.map((id: string) => allCategories.find(c => c[Datastore.KEY].id === id)?.title);

        const diff = actualCategories.filter(a => !dbCategories.includes(a));

        diff.forEach(d => missingCategories.add(d));

        if (diff.length > 0) {
          console.log(company[Datastore.KEY].id, company.companyName, company.changedBy, diff);
        }
      }

    }
  });

  console.log(missingCategories);
}

async function loadCsv(file: string) {
  const parser = parse({ delimiter: ',', from_line: 2, columns: true });
  const all: any[] = [];

  const stream = fs.createReadStream(file)
    .pipe(parser)
    .on('data', row => {
      const toRemove = [
        'I, agree', 'Country', 'City', 'Short', 'ZIP code', 'Street',
        'E-mail', 'Phone', 'Website', 'Reference', 'GPS', 'Social', 'Other, please specify',
        'Facilitators', 'Biogas and RE associations', 'Political', 'Development', 'Research institutions', 'Trade chambers'
      ];

      delete row[''];

      Object.keys(row).forEach(key => {
        toRemove.forEach(r => key.startsWith(r) && delete row[key]);
      });

      Object.keys(row).forEach(key => !row[key] && delete row[key]);

      all.push(row);
    });


  await new Promise(resolve => {
    stream.on('end', () => resolve(null));
  });

  return all;
}

localDatastore();
loadCsv('data/enterprises.csv')
  .then(doWork)
  .then();
