import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArticleListComponent } from './article-list.component';
import { KnowledgeBaseService } from '../knowledge-base.service';
import { EMPTY, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ArticleListComponent', () => {
let component: ArticleListComponent;
let fixture: ComponentFixture<ArticleListComponent>;

beforeEach(waitForAsync(() => {
  TestBed.configureTestingModule({
    declarations: [ArticleListComponent],
    providers: [
      {
        provide: KnowledgeBaseService,
        useValue: {
          getArticles: () => EMPTY
        }
      }
    ],
    imports: [RouterTestingModule],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA]
  })
    .compileComponents();
}));

beforeEach(() => {
  fixture = TestBed.createComponent(ArticleListComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

it('should create', () => {
  expect(component).toBeTruthy();
});

it('should load list of articles', () => {
  const service = TestBed.get(KnowledgeBaseService);
  spyOn(service, 'getArticles').and.returnValue(
    of([
      { name: 'One', id: 'one' },
      { name: 'Another', id: 'two' }
    ])
  );

  component.ngOnInit();
  expect(service.getArticles).toHaveBeenCalled();

  fixture.detectChanges();

  const list = fixture.debugElement.queryAll(By.css('.page-content > mat-nav-list > a'));
  expect(list.length).toBe(2);
  expect(list[0].nativeElement.innerText).toContain('One');
  expect(list[1].nativeElement.innerText).toContain('Another');
});
});
