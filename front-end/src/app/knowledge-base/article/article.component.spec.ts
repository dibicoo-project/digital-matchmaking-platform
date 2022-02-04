import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArticleComponent } from './article.component';
import { KnowledgeBaseService } from '../knowledge-base.service';
import { EMPTY, Subject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { By } from '@angular/platform-browser';

describe('ArticleComponent', () => {
  let component: ArticleComponent;
  let fixture: ComponentFixture<ArticleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ArticleComponent],
      providers: [
        {
          provide: KnowledgeBaseService,
          useValue: {
            getArticle: () => EMPTY
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { parent: { url: 'aaaa'} }, // needed for ".." route
            paramMap: new Subject()
          }
        }
      ],
      imports: [
        MarkdownModule.forRoot(),
        RouterTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and render article', () => {
    const service = TestBed.get(KnowledgeBaseService);
    spyOn(service, 'getArticle').and.returnValue(
      of({
        name: 'Test article',
        text: `
        # Header A

        Lorem ipsum dolor sit amet

        # Header B

        Consectetur adipisicing elit

        * list 1
        * list 2

        Sed do eiusmod tempor incididunt
        `,
        prev: { id: 'one', name: 'One' },
        next: { id: 'two', name: 'Two' },
      })
    );

    const route = TestBed.get(ActivatedRoute);
    route.paramMap.next(convertToParamMap({ id: 'test-article' }));
    expect(service.getArticle).toHaveBeenCalledWith('test-article');
    fixture.detectChanges();
    const hList = fixture.debugElement.queryAll(By.css('markdown > h1'));
    expect(hList.length).toBe(2);

    const pList = fixture.debugElement.queryAll(By.css('markdown > p'));
    expect(pList.length).toBe(3);

    const liList = fixture.debugElement.queryAll(By.css('markdown > ul > li'));
    expect(liList.length).toBe(2);

    const aList = fixture.debugElement.queryAll(By.css('footer > div > a'));
    expect(aList.length).toBe(3);
    expect(aList[0].nativeElement.innerText).toBe('Previous: One');
    expect(aList[2].nativeElement.innerText).toBe('Next: Two');
  });
});
