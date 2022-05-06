import 'reflect-metadata';
import * as fs from 'fs';

import { Datastore } from '@google-cloud/datastore';

import * as lunr from 'lunr';
import { PublicEnterpriseRepository } from '../enterprises/enterprise.repository';
import { PublicEnterprise } from '../enterprises/enterprise.domain';
import { plainId } from '../utils/transform-datastore-id';
import { CategoryRepository } from '../categories/category.repository';
import { PublicApplicationRepository } from '../applications/application.repository';
import { PublicApplication } from '../applications/application.domain';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

const SEPARATOR = /[\W_]+/;

async function main() {
  const datastore = new Datastore();
  const categoriesRepo = new CategoryRepository(datastore);
  const allCategories = await categoriesRepo.findAll();

  const companiesRepo = new PublicEnterpriseRepository(datastore);
  const allCompanies = await companiesRepo.findAll();

  const applicationsRepo = new PublicApplicationRepository(datastore);
  const allApplications = await applicationsRepo.findAll();

  const extractors = {
    locationAtField:
      (fieldName: string) => (obj: any) => Object.values(obj[fieldName] || {}).join(),
    contacts:
      ({ contacts }: PublicEnterprise | PublicApplication) => {
        //TODO: include accents
        const res = contacts
          .flatMap(c => [
            c.name,
            c.department,
            ...c.elements.flatMap(e => {
              switch (e.type) {
                case 'phone':
                  return e.value.replace(/\D/g, '');
                default:
                  return e.value;
              }
            })
          ])
          .filter(c => !!c);
        return res.join();
      },
    categories:
      ({ categoryIds }: { categoryIds: string[] }) => categoryIds.map(id => allCategories.find(c => plainId(c) == id)?.title).join(),
    keyProjects:
      ({ keyProjects }: PublicEnterprise) => (keyProjects || []).flatMap(p => [p.title, p.description, p.webPage, ...Object.values(p.location)])
        .filter(p => !!p)
        .join(),
    attachments:
      ({ attachments }: PublicEnterprise | PublicApplication) => (attachments || []).flatMap(p => [p.description, p.fileName])
        .filter(a => !!a)
        .join(),
    details:
      ({ details }: PublicApplication) => Object.values(details || {}).join()
  }


  // Full text index
  lunr.tokenizer.separator = SEPARATOR;
  const builder = new lunr.Builder();
  builder.ref('id');
  builder.field('companyName');
  builder.field('companyProfile');
  builder.field('description');
  builder.field('webPage');
  builder.field('location', { extractor: extractors.locationAtField('location') });
  builder.field('contactLocation', { extractor: extractors.locationAtField('contactLocation') });
  builder.field('contacts', { extractor: extractors.contacts });
  builder.field('categories', { extractor: extractors.categories });
  builder.field('referenceProjects');
  builder.field('keyProjects', { extractor: extractors.keyProjects });
  builder.field('attachments', { extractor: extractors.attachments });
  builder.field('details', { extractor: extractors.details });


  allCompanies.forEach(comp => {
    builder.add({
      ...comp,
      id: `e${plainId(comp)}`
    });
  });

  allApplications.forEach(app => {
    builder.add({
      ...app,
      id: `b${plainId(app)}`,
      categoryIds: [app.mainCategoryId, app.categoryId]
    });
  });

  const idx = builder.build();

  fs.writeFileSync('./keys.json', JSON.stringify(Object.keys(idx["invertedIndex"])));
  fs.writeFileSync('./index.json', JSON.stringify(idx));
  
  console.dir(idx.search('lorem* ref:b*'), { depth: null });
}


localDatastore();
main().then().catch(err => console.error(err));
