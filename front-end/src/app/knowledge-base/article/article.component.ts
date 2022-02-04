import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnowledgeBaseService } from '../knowledge-base.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  article: any;

  constructor(private route: ActivatedRoute, private service: KnowledgeBaseService) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => this.service.getArticle(params.get('id')))
    ).subscribe(article => {
      this.article = article;
      // remove header from content
      this.article.text = this.article.text.split('\n').slice(1).join('\n');
    });
  }

}
