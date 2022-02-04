import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, EMPTY } from 'rxjs';
import { CategoryService } from '@domain/categories/category.service';

import { CategoriesEditDetailsComponent } from './categories-edit-details.component';

describe('CategoriesEditDetailsComponent', () => {
  let component: CategoriesEditDetailsComponent;
  let fixture: ComponentFixture<CategoriesEditDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CategoriesEditDetailsComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getCategory: () => EMPTY,
            uploadImage: () => EMPTY,
            editCategory: () => EMPTY,
            addCategory: () => EMPTY
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => EMPTY })
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesEditDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data when creating new root category', () => {
    const service = TestBed.inject(CategoryService);
    spyOn(service, 'getCategory');

    const route = TestBed.inject(ActivatedRoute);
    (route.data as any).next({ isNew: true });
    (route.paramMap as any).next({});

    expect(service.getCategory).not.toHaveBeenCalled();
    expect(component.category).toEqual({ parentId: null });
    expect(component.title).toBeFalsy();
    expect(component.imgPreviewUrl).toBeFalsy();
  });

  it('should fetch data when creating new sub category', () => {
    const service = TestBed.inject(CategoryService);
    spyOn(service, 'getCategory').and.callFake((id: string) => of({ id, title: `test parent ${id}` }));

    const route = TestBed.inject(ActivatedRoute);
    (route.data as any).next({ isNew: true });
    (route.paramMap as any).next({ categoryId: '123' });

    expect(service.getCategory).toHaveBeenCalledWith('123');
    expect(component.category).toEqual(jasmine.objectContaining({ parentId: '123' }));
    expect(component.category.ancestorCategories[0].title).toBe('test parent 123');
    expect(component.title).toBeFalsy();
    expect(component.imgPreviewUrl).toBeFalsy();

  });

  it('should fetch data when editing existing category', () => {
    const service = TestBed.inject(CategoryService);
    spyOn(service, 'getCategory').and.callFake((id: string) => {
      if (id === '111') {
        return of({ id, title: 'parent category' });
      } else {
        return of({ id, title: 'the category', parentId: '111', imageUrl: 'image-url' });
      }
    });

    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ categoryId: '999' });

    expect(service.getCategory).toHaveBeenCalledTimes(2);
    expect(component.category).toEqual(
      jasmine.objectContaining({ id: '999', parentId: '111', title: 'the category' })
    );
    expect(component.category.ancestorCategories[0].title).toBe('parent category');
    expect(component.title).toBe('the category');
    expect(component.imgPreviewUrl).toBe('image-url');
  });

  it('should fetch data about all ancestors', () => {
    const service = TestBed.inject(CategoryService);
    spyOn(service, 'getCategory').and.callFake((id: string) => {
      if (id === '111') {
        return of({ id, title: 'direct parent', ancestors: ['10', '20', '30'] });
      } else {
        return of({ id, title: 'ancestor' });
      }
    });

    const route = TestBed.inject(ActivatedRoute);
    (route.data as any).next({ isNew: true });
    (route.paramMap as any).next({ categoryId: '111' });

    expect(service.getCategory).toHaveBeenCalledWith('111');
    expect(service.getCategory).toHaveBeenCalledWith('10');
    expect(service.getCategory).toHaveBeenCalledWith('20');
    expect(service.getCategory).toHaveBeenCalledWith('30');
    expect(component.category.ancestorCategories.map(a => a.id)).toEqual(['10', '20', '30', '111']);
    expect(component.category.ancestorCategories[0].title).toBe('ancestor');
    expect(component.category.ancestorCategories[3].title).toBe('direct parent');
  });

  it('should preview image', () => {
    const mockFile = new File(['dummy'], 'filename', { type: 'image/png' });
    const mockEvt = { target: { files: [mockFile] } };
    const mockReader: FileReader = jasmine.createSpyObj('FileReader', ['readAsDataURL', 'onload']);
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    component.onImgChanged(mockEvt as any);
    expect((window as any).FileReader).toHaveBeenCalled();
    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

  it('should save existing category', () => {
    const service = TestBed.inject(CategoryService);
    const router = TestBed.inject(Router);
    component.selectedFile = new File(['dummy'], 'filename', { type: 'image/png' });
    component.category = { id: '123', title: 'existing' };
    spyOn(service, 'editCategory').and.returnValue(of({ id: '123' }));
    spyOn(service, 'uploadImage').and.returnValue(of(null));
    spyOn(router, 'navigate');

    component.doSave();
    expect(service.editCategory).toHaveBeenCalledWith('123', component.category);
    expect(service.uploadImage).toHaveBeenCalledWith('123', jasmine.anything());
    expect(router.navigate).toHaveBeenCalledWith(['/admin/categories']);
  });

  it('should save new category', () => {
    const service = TestBed.inject(CategoryService);
    const router = TestBed.inject(Router);
    component.selectedFile = new File(['dummy'], 'filename', { type: 'image/png' });
    component.category = { title: 'new' };
    spyOn(service, 'addCategory').and.returnValue(of({ id: '123' }));
    spyOn(service, 'uploadImage').and.returnValue(of(null));
    spyOn(router, 'navigate');

    component.doSave();
    expect(service.addCategory).toHaveBeenCalledWith(component.category);
    expect(service.uploadImage).toHaveBeenCalledWith('123', jasmine.anything());
    expect(router.navigate).toHaveBeenCalledWith(['/admin/categories']);
  });

  it('should navigate back', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.navigateBack();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/categories']);
  });
});
