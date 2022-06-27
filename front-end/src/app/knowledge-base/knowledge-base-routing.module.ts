import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleComponent } from './article/article.component';
import { FactsheetsComponent } from './factsheets/factsheets.component';
import { LiteratureComponent } from './literature/literature.component';
import { factsheetsTour, linksTour, literatureTour } from '@domain/tours';
import { LinksComponent } from './links/links.component';

const routes: Routes = [
  {
    path: 'factsheets',
    component: FactsheetsComponent,
    data: {
      tour: factsheetsTour
    }
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
    component: LinksComponent,
    data: {
      tour: linksTour
    }
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
