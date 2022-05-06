import { Injectable } from '@angular/core';
import { allDetails, Application } from '@domain/applications/application-domain';
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { allSteps, getDetailCodes, WizardState, WizardStep } from './application-wizard.domain';
import * as clone from 'clone';
import { ApplicationService } from '@domain/applications/application.service';
import { distinctUntilObjChanged, select } from '@domain/rxjs-utils';

@Injectable()
export class ApplicationWizardService {

  private readonly initialState: WizardState = {
    steps: allSteps,
    activeStepIdx: 0,
    application: {} as Application,
    applicationId: null,
    autosaveTs: undefined,
    autosaveStatus: undefined,
    detailItems: []
  };

  private readonly state$ = new BehaviorSubject<WizardState>(clone(this.initialState));
  private readonly autosave$ = new Subject<Application>();

  private get state() {
    return this.state$.getValue();
  }

  private set state(val) {
    this.state$.next(val);
  }

  steps$ = this.state$.pipe(select(state => state.steps.filter(s => !s.hidden)));
  invalidSteps$ = this.steps$.pipe(map(steps => steps.filter(s => s.code !== 'publishing' && s.status === 'invalid')));
  detailItems$ = this.state$.pipe(select(state => state.detailItems));
  activeStep$ = this.state$.pipe(select(state => state.steps[state.activeStepIdx]));

  rejectReason$ = this.state$.pipe(select(state => state.application.rejectReason));

  applicationId$ = this.state$.pipe(
    select(state => state.applicationId),
    filter(id => !!id)
  );

  isPublic$ = this.state$.pipe(select(state => state.application.isPublic));
  isPendingReview$ = this.state$.pipe(select(state => state.application.pendingReview));

  autosaveStatus$ = this.state$.pipe(select(state => state.autosaveStatus));
  autosaveTs$ = this.state$.pipe(select(state => state.autosaveTs));

  constructor(private api: ApplicationService) {
    // auto-saving to API
    this.autosave$.pipe(
      debounceTime(500),
      this.saveApplication()
    ).subscribe();

    this.state$.pipe(select(state => state.application)).subscribe(app => {
      const steps = this.state.steps;
      steps.forEach(step => this.updateStepStatus(step, app));
      this.state = { ...this.state, steps: [...steps] };
    });
  }

  private saveApplication() {
    const handleAutosaveError = (err, _) => {
      this.state = { ...this.state, autosaveStatus: 'error' };
      console.error('Autosave error', err);
      return EMPTY;
    };

    return (source: Observable<Application>) => source.pipe(
      map(app => {
        // clean up application
        const details = {};
        this.state.detailItems.forEach(d => {
          details[d.code] = app.details?.[d.code] || undefined;
        });

        return { ...app, details, id: undefined, changedTs: undefined } as Application;
      }),
      distinctUntilObjChanged(),
      tap(_ => this.state = { ...this.state, autosaveStatus: 'saving' }),
      switchMap(app => {
        const id = this.state.applicationId;
        if (!id) {
          return this.api.addApplication(app).pipe(catchError(handleAutosaveError));
        } else {
          return this.api.editApplication(id, app).pipe(catchError(handleAutosaveError));
        }
      }),
      tap(app => {
        this.state = {
          ...this.state,
          application: { ...app },
          applicationId: app.id,
          autosaveStatus: 'saved',
          autosaveTs: app.changedTs
        };
      })
    );
  }

  createNew() {
    const newState = clone(this.initialState);
    newState.steps.forEach(step => this.updateStepStatus(step, {} as Application));
    this.state = newState;
  }

  fetch(id): Observable<Application> {
    this.createNew();
    return this.api.getUserApplication(id)
      .pipe(
        tap(app => {
          this.state = { ...this.state, applicationId: app.id };
          this.updateValue(app, false);
        })
      );
  }

  private updateDetails(newApp: Application, oldApp: Application = null) {
    if (oldApp?.mainCategoryId !== newApp.mainCategoryId
      || oldApp?.categoryId !== newApp.categoryId) {

      // update available detail items
      const codes = getDetailCodes(newApp.mainCategoryId, newApp.categoryId);
      const detailItems = codes.map(code => allDetails.find(d => d.code === code));
      const steps = this.state.steps;
      steps.find(s => s.code === 'details').hidden = detailItems.length === 0;
      this.state = { ...this.state, detailItems, steps };
    }
  }

  private setStepStatus(step: WizardStep, all: any[], required: any[] = all) {
    step.isPending = all.every(a => !a);
    step.status = required.some(r => !r) ? 'invalid' : 'valid';
  }

  private updateStepStatus(step: WizardStep, app: Application) {
    if (step.code === 'business') {
      this.setStepStatus(step, [app.mainCategoryId, app.categoryId], [app.categoryId]);
    } else if (step.code === 'general') {
      this.setStepStatus(step,
        [app.description, ...Object.values(app.location || {})],
        [app.description, app.location?.country]);
    } else if (step.code === 'details') {
      this.setStepStatus(step, [...Object.values(app.details || {})], []);
    } else if (step.code === 'attachments') {
      this.setStepStatus(step, [app.attachments?.length], []);
    } else if (step.code === 'contacts') {
      this.setStepStatus(step,
        [app.companyName, ...Object.values(app.contactLocation || {}), app.contacts?.length],
        [app.contactLocation?.country, app.contacts?.length]);
    } else if (step.code === 'publishing') {
      const otherSteps = this.state.steps.filter(s => s.code !== 'publishing');
      const allValid = otherSteps.every(s => s.status === 'valid');
      step.isPending = !app.dueDate;
      step.status = allValid && !!app.dueDate ? 'valid' : 'invalid';
    }
  }

  updateValue(app: Application, autosave = true) {
    this.updateDetails(app, this.state.application);

    this.state = {
      ...this.state,
      application: app
    };

    if (autosave) {
      this.autosave$.next(app);
    }
  }

  publish() {
    return this.api.changeApplicationStatus(this.state.applicationId, 'publish');
  }

  unpublish() {
    return this.api.changeApplicationStatus(this.state.applicationId, 'unpublish')
      .pipe(
        switchMap(_ => this.fetch(this.state.applicationId))
      );
  }

  next() {
    const curr = this.state;
    let idx = curr.activeStepIdx + 1;
    if (curr.steps[idx].hidden) {
      idx++;
    }
    this.state = { ...curr, activeStepIdx: idx };
  }

  back() {
    const curr = this.state;
    let idx = curr.activeStepIdx - 1;
    if (curr.steps[idx].hidden) {
      idx--;
    }
    this.state = { ...curr, activeStepIdx: idx };
  }

  goToStep(code: string) {
    const curr = this.state;
    const idx = curr.steps.findIndex(s => s.code === code);
    if (idx > -1 && idx !== curr.activeStepIdx) {
      this.state = { ...this.state, activeStepIdx: idx };
    }
  }


}
