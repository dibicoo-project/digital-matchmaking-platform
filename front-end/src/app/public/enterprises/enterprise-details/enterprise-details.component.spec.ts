import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';

import { EnterpriseDetailsComponent } from './enterprise-details.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogService } from '@domain/dialog.service';
import { AuthService } from '@root/app/auth/auth.service';
import { ContactDialogComponent } from '@domain/contacts/contact-dialog/contact-dialog.component';
import { EnterpriseWatchlistService } from '@domain/enterprises/enterprise-watchlist.service';
import { FixNewLinesPipe } from '@domain/pipes/fix-new-lines.pipe';

describe('EnterpriseDetailsComponent', () => {
  let component: EnterpriseDetailsComponent;
  let fixture: ComponentFixture<EnterpriseDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseDetailsComponent, FixNewLinesPipe],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getEnterprise: () => EMPTY,
            sendMessage: () => EMPTY
          }
        },
        {
          provide: EnterpriseWatchlistService,
          useValue: {
            all$: EMPTY
          }
        },
        {
          provide: DialogService,
          useValue: {
            open: () => ({ afterClosed: () => EMPTY }),
            infoDialog: () => EMPTY
          }
        },
        {
          provide: AuthService,
          useValue: {
            login: () => null,
            isAuthenticated$: of(false),
            userProfile$: EMPTY
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get enterprise during onInit', () => {
    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'getEnterprise').and.returnValue(of({ id: '123', companyName: 'TestCompany', categoryIds: [] } as any));

    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ enterpriseId: '123' });

    expect(service.getEnterprise).toHaveBeenCalledWith('123');
    expect(component.enterprise.id).toEqual('123');
  });

  describe('when sending message', () => {

    let router: Router;
    let auth: AuthService;
    let dialog: DialogService;

    beforeEach(() => {
      router = TestBed.inject(Router);
      auth = TestBed.inject(AuthService);
      dialog = TestBed.inject(DialogService);
    });

    it('should login for anonymous user', fakeAsync(() => {
      spyOn(auth, 'login');

      router.navigate(['.'], { fragment: 'contact-form' });
      tick();

      expect(auth.login).toHaveBeenCalled();
    }));

    it('should open dialog for logged in user', fakeAsync(() => {
      spyOn(dialog, 'open').and.callThrough();

      auth.isAuthenticated$ = of(true);
      const profile = { name: 'John' };
      auth.userProfile$ = of(profile);

      router.navigate(['.'], { fragment: 'contact-form' });
      tick();

      expect(dialog.open).toHaveBeenCalledWith(ContactDialogComponent, jasmine.objectContaining({ data: profile }));
    }));

    it('should send message', fakeAsync(() => {
      auth.isAuthenticated$ = of(true);
      auth.userProfile$ = of({});

      const res = { name: 'Peter', email: 'test@example.com', message: 'test' };
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(res) } as any);
      spyOn(dialog, 'infoDialog').and.callThrough();

      const service = TestBed.inject(EnterpriseService);
      spyOn(service, 'sendMessage').and.returnValue(of(null));

      component.enterprise = { id: '123' } as any;

      router.navigate(['.'], { fragment: 'contact-form' });
      tick();

      expect(service.sendMessage).toHaveBeenCalledWith('123', res);
      expect(dialog.infoDialog).toHaveBeenCalled();
    }));

  });
});
