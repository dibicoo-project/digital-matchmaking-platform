import { injectable } from "inversify";
import lunr from "lunr";
import NodeCache from "node-cache";
import { PublicApplicationRepository } from "../applications/application.repository";
import * as extractors from "./field-extractors";
import { CategoryService } from "../categories/category.service";
import { plainId } from "../utils/transform-datastore-id";


@injectable()
export class ApplicationIndex {

  constructor(private cache: NodeCache, private repository: PublicApplicationRepository, private categories: CategoryService) { }

  private getIndexBuilder() {
    lunr.tokenizer.separator = extractors.SEPARATOR;
    const builder = new lunr.Builder();
    builder.ref('id');
    builder.field('companyName');
    builder.field('description');
    builder.field('webPage');
    builder.field('location', { extractor: extractors.locationAtField('location') });
    builder.field('contactLocation', { extractor: extractors.locationAtField('contactLocation') });
    builder.field('contacts', { extractor: extractors.contacts });
    builder.field('categories');
    builder.field('attachments', { extractor: extractors.attachments });
    builder.field('details', { extractor: extractors.details });
    return builder;
  }

  public async get(): Promise<lunr.Index> {
    let idx: lunr.Index | undefined = this.cache.get('applicationIndex');

    if (!idx) {
      const startTime = process.hrtime();
      const apps = await this.repository.findAll();
      const builder = this.getIndexBuilder();
      const allCategories = await this.categories.getAllCached();    
       
      apps.forEach(app => {
        const categories = [app.mainCategoryId, app.categoryId].map(id => allCategories.find(c => plainId(c) === id)?.title).join();
        builder.add({
          ...app,
          id: plainId(app),
          categories
        });
      });

      idx = builder.build();

      this.cache.set('applicationIndex', idx, 15 * 60);
      const endTime = process.hrtime(startTime);
      console.log(`Built application text index in ${endTime[1] / 1000000} ms`)
    }
    
    return idx;
  }
}