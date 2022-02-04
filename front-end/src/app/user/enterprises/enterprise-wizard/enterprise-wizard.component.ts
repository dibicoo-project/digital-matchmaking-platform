import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@domain/dialog.service';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import cleanDeep from 'clean-deep';
import { MatDialog } from '@angular/material/dialog';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { Enterprise, standards } from '@domain/enterprises/enterprise-domain';
import { EMPTY, merge, of, Subject, Subscription } from 'rxjs';

interface WizardStep {
  name: string;
  code: string;
  status: 'pending' | 'valid' | 'invalid';
  icon: string;
  isFirst?: boolean;
  isLast?: boolean;
}

@Component({
  selector: 'app-enterprise-wizard',
  templateUrl: './enterprise-wizard.component.html',
  styleUrls: ['./enterprise-wizard.component.scss']
})
export class EnterpriseWizardComponent implements OnInit {
  standards = standards;
  private initialFormValues: any;
  company: Enterprise;
  readyForPublishing = false;
  autoSaveStatus: 'saving' | 'saved' | 'error';
  private selectedFile: File;

  maxKeyProjects = 5;
  maxAttachments = 5;

  companyForm = this.fb.group({
    general: this.fb.group({
      companyName: ['', Validators.required],
      companyProfile: ['', Validators.required]
    }),
    contacts: this.fb.group({
      webPage: [''],
      contacts: [[], Validators.required],
      location: [{}],
      displayOnGlobalMap: [false],
    }),
    business: this.fb.group({
      categoryIds: [[], Validators.required],
      standards: [[]],
      otherStandards: []
    }),
    projects: this.fb.group({
      referenceProjects: [''],
      keyProjects: [[], Validators.maxLength(this.maxKeyProjects)],
    }),
    attachments: this.fb.group({
      attachments: [[], Validators.maxLength(this.maxAttachments)],
    })
  });

  get validationErrors() {
    const errors = [];
    this.stepCodes.filter(code => code !== 'publishing')
      .forEach(code => {
        const group = this.companyForm.get(code) as FormGroup;
        if (group.valid) {
          return;
        }

        let groupErrors = {};
        Object.entries(group.controls).forEach(([, ctrl]) => {
          if (ctrl.errors !== null) {
            groupErrors = { ...groupErrors, ...ctrl.errors };
          }
        });

        errors.push({ code, name: this.steps.find(s => s.code === code).name, errors: groupErrors });
      });

    return errors;
  }

  get keyProjects() {
    return this.companyForm.get('projects').get('keyProjects').value;
  }

  steps: WizardStep[] = [
    { name: 'General information', code: 'general', status: 'pending', icon: 'business', isFirst: true },
    { name: 'Contact information', code: 'contacts', status: 'pending', icon: 'contact_phone' },
    { name: 'Field of business', code: 'business', status: 'pending', icon: 'description' },
    { name: 'Reference projects', code: 'projects', status: 'pending', icon: 'work' },
    { name: 'Attachments', code: 'attachments', status: 'pending', icon: 'note_add' },
    { name: 'Publishing', code: 'publishing', status: 'pending', icon: 'cloud_done', isLast: true },
  ];

  activeStep: WizardStep;

  get stepCodes(): string[] {
    return this.steps.map(s => s.code);
  }

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: DialogService,
    private matDialog: MatDialog,
    private service: EnterpriseService) { }

  ngOnInit(): void {
    this.initialFormValues = JSON.parse(JSON.stringify(this.companyForm.value));

    this.route.paramMap
      .pipe(
        filter(() => !this.router.getCurrentNavigation()?.extras?.state?.savedNew),
        tap(() => this.resetComponent()),
        map(params => params.get('enterpriseId')),
        filter(id => !!id),
        switchMap(id => {
          if (id === 'new') {
            return of({});
          } else {
            return this.service.getUserEnterprise(id)
              .pipe(
                tap((company: Enterprise) => {
                  this.company = company;

                  Object.entries(this.companyForm.controls).forEach(([, control]) => {
                    control.patchValue(company, { emitEvent: false });
                  });
                  this.autoSaveStatus = 'saved';

                  this.steps.forEach(step => {
                    this.updateStepStatus(step);
                  });

                  this.companyForm.markAllAsTouched();
                })
              );
          }
        }),
        tap(() => this.enableAutoSave()),
      ).subscribe();

    this.route.fragment.subscribe(code => {
      if (this.activeStep) {
        this.updateStepStatus(this.activeStep);
      }
      this.activeStep = this.steps.find(s => s.code === code) || this.steps[0];
    });
  }

  resetComponent() {
    //TODO: better way to reset component?
    this.disableAutoSave();
    this.companyForm.reset(this.initialFormValues, { emitEvent: false });
    this.company = {
      status: 'draft',
      readyForPublishing: false
    } as Enterprise;
    this.autoSaveStatus = null;
    this.steps.forEach(step => step.status = 'pending');
  }

  private autoSaveSub: Subscription;
  private logoChanges = new Subject<void>();

  private enableAutoSave() {
    this.disableAutoSave();

    const handleAutosaveError = (err, _) => {
      this.autoSaveStatus = 'error';
      console.error('Autosave error', err);
      return EMPTY;
    };

    this.autoSaveSub = merge(
      this.companyForm.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(null, val => JSON.stringify(val)),
      ),
      this.logoChanges.pipe(
        map(() => this.companyForm.value)
      )
    ).pipe(
      map(val => Object.values(val).reduce((prev: any, curr: any) => ({ ...prev, ...curr }), {})), // flat map form value object
      filter(val => !!val),
      switchMap((val: Enterprise) => {
        this.autoSaveStatus = 'saving';
        if (!!val.webPage && !/^https?:\/\//.test(val.webPage)) {
          val.webPage = 'http://' + val.webPage;
          this.companyForm.get('contacts').get('webPage').setValue(val.webPage, { emitEvent: false });
        }

        val.keyProjects.forEach(proj => {
          if (!!proj.webPage && !/^https?:\/\//.test(proj.webPage)) {
            proj.webPage = 'http://' + proj.webPage;
          }
        });

        if (this.company.id) {
          return this.service.editEnterprise(this.company.id, val)
            .pipe(
              catchError(handleAutosaveError)
            );
        } else {
          return this.service.addEnterprise(val)
            .pipe(
              catchError(handleAutosaveError),
              tap((res: Enterprise) => {
                this.router.navigate(['..', res.id], { preserveFragment: true, relativeTo: this.route, state: { savedNew: true } });
              })
            );
        }
      }),
      switchMap(val => {
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('logo', this.selectedFile, this.selectedFile.name);
          return this.service.addEnterpriseLogo(val.id, formData)
            .pipe(
              catchError(handleAutosaveError),
              tap(logo => {
                this.selectedFile = null;
                val.imageUrl = logo.imageUrl;
              }),
              map(() => val)
            );
        } else {
          return of(val);
        }
      }),
      tap(val => {
        this.company = val;
        this.autoSaveStatus = 'saved';
      }),
    ).subscribe();
  }

  private disableAutoSave() {
    if (this.autoSaveSub) {
      this.autoSaveSub.unsubscribe();
      this.autoSaveSub = null;
    }
  }

  private updateStepStatus(step: WizardStep) {
    const group = this.companyForm.get(step.code) as FormGroup;

    if (group) {
      // TODO: check is cleanDeep complexity needed here
      // find any non-empty value
      step.status = group.invalid ? 'invalid' : (Object.keys(cleanDeep(group.value)).length === 0 ? 'pending' : 'valid');
      group.markAllAsTouched();
    }
  }

  publish() {
    this.service.changeEnterpriseStatus(this.company.id, 'publish')
      .subscribe(_ => this.router.navigate(['..'], { relativeTo: this.route }));
  }

  back() {
    const idx = this.stepCodes.indexOf(this.activeStep.code);
    this.router.navigate([], { fragment: this.stepCodes[idx - 1] });
  }

  next() {
    const idx = this.stepCodes.indexOf(this.activeStep.code);
    this.router.navigate([], { fragment: this.stepCodes[idx + 1] });
  }

  logoChanged(event: any) {
    this.selectedFile = event.target.files[0] as File;

    // get image as base64 string
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      this.company.imageUrl = reader.result as any;
    };

    this.logoChanges.next();
  }

  deleteLogoClicked(): void {
    this.dialog.confirmDialog('Logo Delete Confirmation', 'Are you sure you want to delete company logo?')
      .subscribe(([ok]) => {
        if (ok) {
          if (this.company.id && this.company.imageUrl) {
            this.service.deleteEnterpriseLogo(this.company.id)
              .subscribe(() => this.company.imageUrl = null);
          } else { // not saved yet
            this.company.imageUrl = null;
          }
        }
      });
  }

  private openKeyProjectDialog(template: any, proj: any) {
    const data = JSON.parse(JSON.stringify(proj));
    const ref = this.matDialog.open(template, { data });

    return ref.afterClosed().pipe(
      filter(res => !!res)
    );
  }

  addKeyProject(template: any) {
    this.openKeyProjectDialog(template, {}).subscribe(res => {
      this.keyProjects.push(res);
      this.companyForm.updateValueAndValidity();
    });
  }

  editKeyProject(template: any, proj: any) {
    this.openKeyProjectDialog(template, proj)
      .subscribe(res => {
        Object.assign(proj, res);
        this.companyForm.updateValueAndValidity();
      });
  }

  removeKeyProject(idx: number) {
    this.keyProjects.splice(idx, 1);
    this.companyForm.updateValueAndValidity();
  }

}
