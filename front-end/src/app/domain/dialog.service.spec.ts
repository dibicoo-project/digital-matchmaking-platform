import { TestBed } from '@angular/core/testing';

import { DialogService } from './dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DialogService,
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => EMPTY })
          }
        }
      ]
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open confirm dialog', () => {
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.callThrough();
    service.confirmDialog('title', 'content').subscribe();
    expect(dialog.open).toHaveBeenCalledWith(DialogComponent,
      jasmine.objectContaining({
        data: { dialogType: 'confirm', title: 'title', content: 'content' }
      }));
  });

  it('should open input dialog', () => {
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.callThrough();
    service.inputDialog('title', 'content', 'input label').subscribe();
    expect(dialog.open).toHaveBeenCalledWith(DialogComponent,
      jasmine.objectContaining({
        data: { dialogType: 'input', title: 'title', content: 'content', inputFieldLabel: 'input label', inputValue: '' }
      }));
  });

  it('should open info dialog', () => {
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.callThrough();
    service.infoDialog('title', 'content').subscribe();
    expect(dialog.open).toHaveBeenCalledWith(DialogComponent,
      jasmine.objectContaining({
        data: { dialogType: 'info', title: 'title', content: 'content' }
      }));
  });
});
