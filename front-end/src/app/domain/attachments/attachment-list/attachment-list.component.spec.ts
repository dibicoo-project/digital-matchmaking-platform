import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from '@domain/dialog.service';
import { of } from 'rxjs';

import { AttachmentListComponent } from './attachment-list.component';

describe('AttachmentListComponent', () => {
  let component: AttachmentListComponent;
  let fixture: ComponentFixture<AttachmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttachmentListComponent],
      providers: [
        {
          provide: DialogService,
          useValue: {
            open: () => null,
            infoDialog: () => null
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should write', () => {
    it('null', () => {
      component.writeValue(null);
      expect(component.attachments).toEqual([]);
    });

    it('object', () => {
      component.writeValue({ a: 1, b: 2 });
      expect(component.attachments).toEqual([]);
    });

    it('valid value', () => {
      component.writeValue([{}, {}]);
      expect(component.attachments.length).toBe(2);
    });
  });

  it('should add item', () => {
    const input = {
      files: [{ name: 'test.file' }],
      onchange: () => null,
      click: () => {
        input.onchange();
      }
    };
    component.fileInput.nativeElement = input;

    component.attachments = [];
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ id: '123' }) } as any);

    component.addItem();

    expect(component.attachments[0].id).toEqual('123');
  });


  it('should reject 5MB+ files', () => {
    const input = {
      files: [{ size: 5 * 1024 * 1024 + 1 }],
      onchange: () => null,
      click: () => {
        input.onchange();
      }
    };
    component.fileInput.nativeElement = input;

    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'infoDialog');

    component.addItem();

    expect(dialog.infoDialog).toHaveBeenCalled();
  });

  it('should handle upload errors', () => {
    const input = {
      files: [{ name: 'test.file' }],
      onchange: () => null,
      click: () => {
        input.onchange();
      }
    };
    component.fileInput.nativeElement = input;

    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ error: { message: 'testing' } }) } as any);
    spyOn(dialog, 'infoDialog');

    component.addItem();

    expect(dialog.infoDialog).toHaveBeenCalledWith('File upload error', 'testing');
  });

  it('should edit item', () => {
    component.attachments = [{}, {}, {}];
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ description: 'new' }) } as any);
    component.editItem(1);
    expect(component.attachments[1].description).toEqual('new');
  });

  it('should remove item', () => {
    component.attachments = [{ id: '111' }, { id: '222' }, { id: '333' }];
    component.removeItem(1);
    expect(component.attachments[1].id).toEqual('333');
  });
});
