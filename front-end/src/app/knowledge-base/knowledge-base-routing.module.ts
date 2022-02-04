import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleComponent } from './article/article.component';
import { FactsheetsComponent } from './factsheets/factsheets.component';
import { LiteratureComponent } from './literature/literature.component';
import { literatureTour } from '@domain/tours';
import { LinksComponent } from './links/links.component';

const routes: Routes = [
  {
    path: 'factsheets',
    component: FactsheetsComponent
  },
  {
    path: 'literature',
    component: LiteratureComponent,
    data: {
      tour: literatureTour
    }
  },
  {
    path: 'links',
    component: LinksComponent
  },
  {
    path: 'factsheets/:id',
    component: ArticleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeBaseRoutingModule { }
