import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiBiCooMaterialModule } from '../material.module';

import { KnowledgeBaseRoutingModule } from './knowledge-base-routing.module';
import { MarkdownModule } from 'ngx-markdown';
import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleComponent } from './article/article.component';
import { LiteratureComponent } from './literature/literature.component';
import { FactsheetsComponent } from './factsheets/factsheets.component';
import { LinksComponent } from './links/links.component';


@NgModule({
  declarations: [
    ArticleListComponent,
    ArticleComponent,
    LiteratureComponent,
    FactsheetsComponent,
    LinksComponent,
  ],
  imports: [
    CommonModule,
    DiBiCooMaterialModule,
    MarkdownModule.forRoot(),
    KnowledgeBaseRoutingModule,
  ]
})
export class KnowledgeBaseModule { }
