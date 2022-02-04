import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnterpriseShareComponent } from './enterprise-share.component';
import { RouterTestingModule } from '@angular/router/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { EMPTY, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

describe('EnterpriseShareComponent', () => {
  let component: EnterpriseShareComponent;
  let fixture: ComponentFixture<EnterpriseShareComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseShareComponent],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getEnterpriseShares: () => EMPTY,
            addEnterpriseShare: () => EMPTY,
            revokeEnterpriseShare: () => EMPTY
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => null
          }
        },
        {
          provide: 'ORIGIN',
          useValue: 'http://testing-host/'
        }
      ],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load share information on init', () => {
    const route = TestBed.get(ActivatedRoute);
    route.paramMap.next({ enterpriseId: '123' });
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'getEnterpriseShares').and.returnValue(of({
      id: '123',
      companyName: 'Testing company',
      owners: [],
      invites: []
    }));

    component.ngOnInit();
    expect(service.getEnterpriseShares).toHaveBeenCalledWith('123');
  });

  it('should create invitation link', () => {
    const newShare = { name: 'test', id: '123-456' };
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'addEnterpriseShare').and.returnValue(of(newShare));
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.returnValues(
      { afterClosed: () => of('John') },
      { afterClosed: () => EMPTY },
    );

    component.shares = { id: '123', invites: [] } as any;
    component.inviteClicked(null, null);

    expect(dialog.open).toHaveBeenCalledWith(null);
    expect(service.addEnterpriseShare).toHaveBeenCalledWith('123', { name: 'John' });
    expect(dialog.open).toHaveBeenCalledWith(null, { data: newShare });
    expect(dialog.open).toHaveBeenCalledTimes(2);
  });

  it('should revoke invitation link', () => {
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'revokeEnterpriseShare').and.returnValue(of(null));
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.returnValues(
      { afterClosed: () => of(true) },
    );

    component.shares = { id: '123', invites: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] } as any;
    component.revokeClicked(null, { id: 'b', name: 'John' });

    expect(dialog.open).toHaveBeenCalledWith(null, { data: 'John' });
    expect(service.revokeEnterpriseShare).toHaveBeenCalledWith('123', { invite: 'b' });
    expect(component.shares.invites).not.toContain({ id: 'b' } as any);
  });

  it('should remove manager', () => {
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'revokeEnterpriseShare').and.returnValue(of(null));
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.returnValues(
      { afterClosed: () => of(true) },
    );

    component.shares = { id: '123', owners: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] } as any;
    component.removeClicked(null, { id: 'b'});

    expect(dialog.open).toHaveBeenCalled();
    expect(service.revokeEnterpriseShare).toHaveBeenCalledWith('123', { owner: 'b' });
    expect(component.shares.owners).not.toContain({ id: 'b' } as any);
  });
});
