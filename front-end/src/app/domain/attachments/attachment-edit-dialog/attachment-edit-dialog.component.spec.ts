import { HttpEventType } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { concat, EMPTY, from, merge, of, throwError } from 'rxjs';
import { concatMap, delay, map } from 'rxjs/operators';
import { AttachmentService } from '../attachment.service';

import { AttachmentEditDialogComponent } from './attachment-edit-dialog.component';

describe('AttachmentEditDialogComponent', () => {
  let component: AttachmentEditDialogComponent;
  let fixture: ComponentFixture<AttachmentEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttachmentEditDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: () => null
          }
        },
        {
          provide: AttachmentService,
          useValue: {
            upload: () => EMPTY
          }
        }
      ],
      imports: [FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should upload new file', fakeAsync(() => {
    const progress$ = from([150, 570, 795]).pipe(
      map(v => ({ type: HttpEventType.UploadProgress, loaded: v, total: 800 } as any)),
      concatMap(one => of(one).pipe(delay(10)))
    );

    const service = TestBed.inject(AttachmentService);
    spyOn(service, 'upload').and.returnValue(
      concat(progress$, of({ type: HttpEventType.Response, body: { id: 'test-123' } }))
    );

    const dialog = TestBed.inject(MatDialogRef);
    spyOn(dialog, 'close');

    component.file = {} as File;
    component.save();

    expect(service.upload).toHaveBeenCalled();
    tick(10);
    expect(component.uploadProgress).toEqual(19);
    tick(10);
    expect(component.uploadProgress).toEqual(71);
    tick(10);
    expect(component.uploadProgress).toEqual(99);
    expect(dialog.close).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'test-123' }));
  }));

  it('should handle upload error', () => {
    const service = TestBed.inject(AttachmentService);
    spyOn(service, 'upload').and.returnValue(throwError({ error: 'testing' }));

    const dialog = TestBed.inject(MatDialogRef);
    spyOn(dialog, 'close');

    component.file = {} as File;
    component.save();

    expect(service.upload).toHaveBeenCalled();
    expect(dialog.close).toHaveBeenCalledWith({ error: 'testing' });
  });

  it('should update existing file description', () => {
    const dialog = TestBed.inject(MatDialogRef);
    spyOn(dialog, 'close');

    component.item = { description: 'new' };
    component.save();

    expect(dialog.close).toHaveBeenCalledWith(jasmine.objectContaining({ description: 'new' }));
  });
});
