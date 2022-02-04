import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from './category-domain';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { CacheKey, CacheService } from '@domain/cache.service';

@Injectable()
export class CategoryService {

  constructor(private http: HttpClient, private cache: CacheService) { }

  getCategories(): Observable<Category[]> {
    return this.cache.getOrFetch(CacheKey.categories, 5 * 60,
      () => this.http.get<Category[]>(`/api/categories`).pipe(
        map(categories => {
          const adId = categories.find(c => c.title === 'Anaerobic Digestion')?.id;
          const gasId = categories.find(c => c.title === 'Gasification')?.id;

          categories.forEach(cat => {
            cat.isAD = cat.id === adId || cat.ancestors.includes(adId);
            cat.isGAS = cat.id === gasId || cat.ancestors.includes(gasId);
          });
          return categories;
        })
      )
    );
  }

  all$ = this.getCategories();

  private fillTree = (all: Category[], startFromParentId: string) => {

    const fillRelatives = (parent: Category) => {
      const children = all.filter(one => one.parentId === parent.id);
      children.forEach(one => fillRelatives(one));
      parent.childrenCategories = children;
      parent.ancestorCategories = parent.ancestors.map(anc => all.find(one => one.id === anc));
    };

    let roots: Category[];
    if (startFromParentId === null) {
      roots = all.filter(one => one.parentId === null);
    } else {
      roots = all.filter(one => one.id === startFromParentId);
    }

    roots.forEach(one => fillRelatives(one));
    return roots;
  };

  tree$ = this.all$.pipe(
    map(all => this.fillTree(all, null)),
    shareReplay(1)
  );

  byId$(id: string) {
    return this.all$.pipe(
      map(all => all?.filter(c => c.id === id)[0])
    );
  }

  treeById$(id: string) {
    return this.all$.pipe(
      map(all => this.fillTree(all, id)[0]),
    );
  }

  getRootCategories(): Observable<Category[]> {
    return this.getCategories().pipe(
      map(list => list.filter(c => c.parentId == null))
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`/api/categories/${id}`);
  }

  addCategory(data: Category): Observable<Category> {
    this.cache.delete(CacheKey.categories);
    return this.http.post<Category>(`/api/categories`, data);
  }

  editCategory(id: string, data: Category): Observable<Category> {
    this.cache.delete(CacheKey.categories);
    return this.http.put<Category>(`/api/categories/${id}`, data);
  }

  uploadImage(id: string, data: FormData): Observable<string> {
    this.cache.delete(CacheKey.categories);
    return this.http.post<string>(`/api/categories/${id}/imgupload`, data);
  }

  deleteCategory(id: string): Observable<string> {
    this.cache.delete(CacheKey.categories);
    return this.http.delete<string>(`/api/categories/${id}`);
  }

  categoryIdsToFlatList(ids: string[]): Observable<Category[][]> {
    return this.getCategories()
      .pipe(
        map((categories: Category[]) => {
          const parentId = (id: string) => categories.find(c => c.id === id).parentId;

          const allChildrenSelected = (id: string, list) => {
            if (id == null) {
              return false;
            }
            return categories.filter(c => c.parentId === id).every(c => list.includes(c.id));
          };

          // find only fully selected categories (includes leaf nodes)
          let cnt: number;
          do {
            cnt = ids.length;
            ids = ids.filter(id => allChildrenSelected(id, ids));
          } while (ids.length !== cnt);

          // remove children from fully selected parents
          do {
            cnt = ids.length;
            ids = ids.filter(id => !allChildrenSelected(parentId(id), ids));
          } while (ids.length !== cnt);

          const chains = categories.filter(c => ids.includes(c.id))
            .map(one => {
              const ancestors = one.ancestors.map(aid => categories.find(c => c.id === aid));
              return [
                ...ancestors,
                one
              ];
            });

          return chains;
        })
      );
  }
}
