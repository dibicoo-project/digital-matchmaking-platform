import { Component, OnInit } from '@angular/core';
import { KnowledgeBaseService } from '../knowledge-base.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {
articles: any;

constructor(private service: KnowledgeBaseService) { }

ngOnInit() {
  this.service.getArticles().subscribe(list => {
    this.articles = list;
  });
}

}
