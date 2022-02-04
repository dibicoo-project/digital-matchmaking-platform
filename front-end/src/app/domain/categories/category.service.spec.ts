import { TestBed, inject } from '@angular/core/testing';
import { Category } from './category-domain';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CategoryService } from './category.service';
import { CacheService } from '@domain/cache.service';
import { of } from 'rxjs';

describe('CategoryService', () => {
  let http: HttpTestingController;
  let service: CategoryService;
  const url = '/api/categories';
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryService, CacheService],
      imports: [HttpClientTestingModule]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CategoryService);
  });

  afterEach(() => {
    http.verify();
    expect(1).toBe(1);
  });

  it('should be created', inject([CategoryService], () => {
    expect(service).toBeTruthy();
  }));

  it('should get category list', () => {
    service.getCategories().subscribe();
    http.expectOne({ method: 'GET', url });
  });

  it('should add new category', () => {
    const newCategory = { title: 'Title', parentId: null, ancestors: [], id: '100' };
    service.addCategory(newCategory).subscribe();
    http.expectOne({ method: 'POST', url });
  });

  it('should edit category', () => {
    service.editCategory('100', {} as Category).subscribe();
    http.expectOne({ method: 'PUT', url: url + '/100' });
  });

  it('should uplod image', () => {
    service.uploadImage('123', new FormData()).subscribe();
    http.expectOne({ method: 'POST', url: url + '/123/imgupload' });
  });

  it('should delete category', () => {
    service.deleteCategory('123').subscribe();
    http.expectOne({ method: 'DELETE', url: url + '/123' });
  });

  it('should convert ids to flat list', (done) => {
    spyOn(service, 'getCategories').and.returnValue(
      of([
        { id: 'a', parentId: null, ancestors: [] },
        { id: 'a1', parentId: 'a', ancestors: ['a'] },
        { id: 'a2', parentId: 'a', ancestors: ['a'] },
        { id: 'b', parentId: null, ancestors: [] },
        { id: 'b1', parentId: 'b', ancestors: ['b'] },
        { id: 'b1a', parentId: 'b1', ancestors: ['b', 'b1'] },
        { id: 'b1b', parentId: 'b1', ancestors: ['b', 'b1'] },
        { id: 'b2', parentId: 'b', ancestors: ['b'] },
      ] as Category[])
    );

    service.categoryIdsToFlatList(['a', 'a1', 'b1', 'b1a', 'b1b']).subscribe(result => {
      expect(result[0].map(r => r.id)).toEqual(['a', 'a1']);
      expect(result[1].map(r => r.id)).toEqual(['b', 'b1']);
      done();
    });
  });

  describe('observables should fetch', () => {
    let resp: Category[];
    beforeEach(() => {
      resp = [
        { id: '1', parentId: null, title: 'Anaerobic Digestion', ancestors: [] },
        { id: '2', parentId: null, title: 'Gasification', ancestors: [] },
        { id: '11', parentId: '1', ancestors: ['1'] },
        { id: '22', parentId: '2', ancestors: ['2'] },
        { id: '111', parentId: '11', ancestors: ['1', '11'] },
        { id: '222', parentId: '22', ancestors: ['2', '22'] },
      ];
    });

    it('all categories', (done) => {
      service.all$.subscribe(list => {
        expect(list.find(c => c.id === '1').isAD).toBeTrue();
        expect(list.find(c => c.id === '111').isAD).toBeTrue();
        expect(list.find(c => c.id === '2').isGAS).toBeTrue();
        expect(list.find(c => c.id === '222').isGAS).toBeTrue();
        done();
      });

      http.expectOne({ method: 'GET', url }).flush(resp);
    });

    it('tree of categories', (done) => {
      service.tree$.subscribe(list => {
        expect(list.find(c => c.id === '1').childrenCategories[0].id).toEqual('11');
        expect(list.find(c => c.id === '2').childrenCategories[0].id).toEqual('22');
        done();
      });

      http.expectOne({ method: 'GET', url }).flush(resp);
    });

    it('one by id', (done) => {
      service.byId$('22').subscribe(one => {
        expect(one.id).toEqual('22');
        done();
      });

      http.expectOne({ method: 'GET', url }).flush(resp);
    });
  });
});
