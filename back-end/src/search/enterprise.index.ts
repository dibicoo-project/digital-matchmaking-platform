import { injectable } from "inversify";
import lunr from "lunr";
import NodeCache from "node-cache";
import { plainId } from "../utils/transform-datastore-id";
import { PublicEnterpriseRepository } from "../enterprises/enterprise.repository";
import * as extractors from "./field-extractors";
import { CategoryService } from "../categories/category.service";


@injectable()
export class EnterpriseIndex {

  constructor(private cache: NodeCache, private repository: PublicEnterpriseRepository, private categories: CategoryService) { }

  private getBuilder() {
    lunr.tokenizer.separator = extractors.SEPARATOR;
    const builder = new lunr.Builder();
    builder.ref('id');
    builder.field('companyName');
    builder.field('companyProfile');
    builder.field('webPage');
    builder.field('location', { extractor: extractors.locationAtField('location') });
    builder.field('contacts', { extractor: extractors.contacts });
    builder.field('categories');
    builder.field('referenceProjects');
    builder.field('keyProjects', { extractor: extractors.keyProjects });
    builder.field('attachments', { extractor: extractors.attachments });
    return builder;
  }

  public async get(): Promise<lunr.Index> {
    let idx: lunr.Index | undefined = this.cache.get('companyIndex');

    if (!idx) {
      const startTime = process.hrtime();
      const companies = await this.repository.findAll();
      const builder = this.getBuilder();
      const allCategories = await this.categories.getAllCached();

      companies.forEach(comp => {
        const categories = comp.categoryIds.map(id => allCategories.find(c => plainId(c) === id)?.title).join();
        builder.add({
          ...comp,
          id: plainId(comp),
          categories
        });
      });
      idx = builder.build();

      this.cache.set('companyIndex', idx, 15 * 60);
      const endTime = process.hrtime(startTime);
      console.log(`Built companies text index in ${endTime[1] / 1000000} ms`)
    }

    return idx;
  }

}