import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Application } from '@domain/application-domain';
import { ApplicationService } from '@domain/application.service';
import { EMPTY, of, throwError } from 'rxjs';
import { pairwise, skip } from 'rxjs/operators';
import { WizardStep } from './application-wizard.domain';

import { ApplicationWizardService } from './application-wizard.service';

describe('ApplicationWizardService', () => {
  let service: ApplicationWizardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationWizardService,
        {
          provide: ApplicationService,
          useValue: {
            getUserApplication: () => EMPTY,
            addApplication: () => EMPTY,
            editApplication: () => EMPTY,
            changeApplicationStatus: () => EMPTY
          }
        }]
    });
    service = TestBed.inject(ApplicationWizardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('should change step to', () => {
    it('code', () => {
      service.goToStep('contacts');
      service.activeStep$.subscribe(s =>
        expect(s.code).toEqual('contacts')
      );
    });

    it('next', () => {
      service.goToStep('general');
      service.next();
      service.activeStep$.subscribe(s =>
        expect(s.code).toEqual('attachments')
      );
    });

    it('prev', () => {
      service.goToStep('attachments');
      service.back();
      service.activeStep$.subscribe(s =>
        expect(s.code).toEqual('general')
      );
    });
  });

  it('should create new', () => {
    service.createNew();
    service.steps$.subscribe(list => {
      expect(list.every(s => s.isPending)).toBeTrue();
      expect(list.map(s => s.status)).toEqual(['invalid', 'invalid', 'valid', 'invalid', 'invalid']);
    });
    service.invalidSteps$.subscribe(list =>
      expect(list.length).toBe(3)
    );
    service.isPublic$.subscribe(is => expect(is).toBeFalsy());
  });

  it('should fetch existing', () => {
    const api = TestBed.inject(ApplicationService);
    spyOn(api, 'getUserApplication').and.returnValue(
      of({ id: '123', rejectReason: 'testing', mainCategoryId: '111', pendingReview: true, isPublic: true } as Application)
    );
    service.fetch('123').subscribe(app => expect(app.mainCategoryId).toEqual('111'));
    service.applicationId$.subscribe(id => expect(id).toEqual('123'));
    service.rejectReason$.subscribe(reason => expect(reason).toEqual('testing'));
    service.isPublic$.subscribe(isPublic => expect(isPublic).toBeTruthy());
    service.isPendingReview$.subscribe(isPending => expect(isPending).toBeTruthy());
  });

  describe('should update details', () => {
    it('when main category changes', () => {
      // AD turnkey providers
      service.updateValue({ mainCategoryId: '6215111412809728' } as any, false);
      service.detailItems$.subscribe(items => expect(items.length).toBe(5));
      service.steps$.subscribe(list => expect(list.length).toBe(6));
    });

    it('when category changes', () => {
      // AD pumps
      service.updateValue({ categoryId: '4873569787969536' } as any, false);
      service.detailItems$.subscribe(items => expect(items.length).toBe(3));
      service.steps$.subscribe(list => expect(list.length).toBe(6));
    });

    it('when other category selected', () => {
      service.updateValue({ categoryId: 'random-testing' } as any, false);
      service.detailItems$.subscribe(items => expect(items.length).toBe(0));
      service.steps$.subscribe(list => expect(list.length).toBe(5));
    });
  });

  describe('should update step statuses', () => {
    const expectStatus = (list: WizardStep[], code: string, status: string) =>
      expect(list.find(s => s.code === code)?.status).toEqual(status);

    it('to initial', () => {
      service.steps$.subscribe(list => {
        expect(list.every(s => s.isPending));
        expectStatus(list, 'business', 'invalid');
        expectStatus(list, 'general', 'invalid');
        expectStatus(list, 'contacts', 'invalid');
        expectStatus(list, 'publishing', 'invalid');
      });
    });

    it('for business', () => {
      service.updateValue({ mainCategoryId: '123', categoryId: '987' } as Application, false);
      service.steps$.subscribe(list => expectStatus(list, 'business', 'valid'));
    });

    it('for general', () => {
      service.updateValue({ description: 'testing', location: { country: 'Wonderland' } } as Application, false);
      service.steps$.subscribe(list => expectStatus(list, 'general', 'valid'));
    });

    it('for contacts', () => {
      service.updateValue({ contactLocation: { country: 'Wonderland' }, contacts: [{ name: 'John The Tester' }] } as Application, false);
      service.steps$.subscribe(list => expectStatus(list, 'contacts', 'valid'));
    });

    it('for publishing', () => {
      service.updateValue({
        mainCategoryId: '123',
        categoryId: '987',
        description: 'testing',
        location: { country: 'Wonderland' },
        contactLocation: { country: 'Wonderland' },
        contacts: [{ name: 'John The Tester' }],
        dueDate: new Date()
      } as Application, false);
      service.steps$.subscribe(list => expectStatus(list, 'publishing', 'valid'));
    });
  });

  describe('should save application', () => {
    let api: ApplicationService;
    const now = new Date();
    const expectAutosaveStatus = (a: string, b: string) => service.autosaveStatus$.pipe(skip(1), pairwise())
      .subscribe(([s1, s2]) => {
        expect(s1).toEqual(a);
        expect(s2).toEqual(b);
      });

    beforeEach(() => {
      api = TestBed.inject(ApplicationService);
    });

    it('when value changes for new application', fakeAsync(() => {
      spyOn(api, 'addApplication').and.returnValue(of({ id: '123', changedTs: now } as Application));
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['state'].detailItems = [{ code: 'a' } as any, { code: 'b' } as any];
      expectAutosaveStatus('saving', 'saved');

      service.updateValue({ description: 'testing', companyName: undefined, details: { a: 123, c: 987 } as any } as Application);

      tick(500);
      expect(api.addApplication).toHaveBeenCalledWith(
        jasmine.objectContaining(
          { description: 'testing', details: { a: 123, b: undefined } as any } as Application
        )
      );
    }));

    it('when value changes for existing application', fakeAsync(() => {
      spyOn(api, 'editApplication').and.returnValue(of({ id: '123', changedTs: now } as Application));
      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['state'].applicationId = '123';
      expectAutosaveStatus('saving', 'saved');

      service.updateValue({ description: 'testing' } as Application);

      tick(500);
      expect(api.editApplication).toHaveBeenCalledWith('123',
        jasmine.objectContaining(
          { description: 'testing' } as Application
        )
      );
    }));

    it('when request fails', fakeAsync(() => {
      spyOn(api, 'addApplication').and.returnValue(throwError('testing'));
      expectAutosaveStatus('saving', 'error');

      service.updateValue({} as Application);
      tick(500);
    }));
  });

  it('should publish the application', () => {
    const api = TestBed.inject(ApplicationService);
    spyOn(api, 'changeApplicationStatus').and.returnValue(of({} as any));
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['state'].applicationId = '123';
    service.publish().subscribe();
    expect(api.changeApplicationStatus).toHaveBeenCalledWith('123', 'publish');
  });
});
