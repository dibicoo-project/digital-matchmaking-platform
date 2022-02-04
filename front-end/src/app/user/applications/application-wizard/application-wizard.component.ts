import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { allDetailsObject, Application } from '@domain/application-domain';
import { CategoryService } from '@domain/categories/category.service';
import * as moment from 'moment';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ApplicationWizardService } from './application-wizard.service';



@Component({
  selector: 'app-application-wizard',
  templateUrl: './application-wizard.component.html',
  styleUrls: ['./application-wizard.component.scss'],
  providers: [ApplicationWizardService]
})
export class ApplicationWizardComponent implements OnInit {
  minDate = moment();
  maxDate = moment().add(6, 'M');

  readyForPublishing = false;

  applicationForm = this.fb.group({
    field: [null, Validators.required],
    description: [undefined, Validators.required],
    location: [{}, Validators.required],
    details: this.fb.group(allDetailsObject),
    attachments: [[]],
    companyName: [undefined],
    contactLocation: [{}],
    contacts: [[], Validators.required],
    dueDate: [undefined, Validators.required]
  }, {
    validators: [(form) => form.value?.field?.categoryId ? null : { required: 'categoryId' }]
  });

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public service: ApplicationWizardService,
    public categories: CategoryService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('applicationId')),
      filter(id => !!id),
      filter(_ => !this.router.getCurrentNavigation()?.extras?.state?.savedNew)
    ).subscribe(id => {
      if (id === 'new') {
        this.applicationForm.reset(
          { location: {}, attachments: [], contactLocation: {}, contacts: [] } as Application,
          { emitEvent: false });
        this.service.createNew();
        this.readyForPublishing = false;
      } else {
        this.service.fetch(id).subscribe(app => {
          this.applicationForm.patchValue({
            ...app,
            field: { categoryId: app.categoryId, mainCategoryId: app.mainCategoryId }
          }, { emitEvent: false });
        });
      }
    });

    this.route.fragment.subscribe(code => this.service.goToStep(code));
    this.service.activeStep$.subscribe(step => this.router.navigate([], { fragment: step.code }));

    this.applicationForm.valueChanges.subscribe(val => {
      this.service.updateValue({
        ...val,
        field: undefined,
        mainCategoryId: val.field?.mainCategoryId,
        categoryId: val.field?.categoryId
      });
    });

    this.service.applicationId$.subscribe(id => {
      this.router.navigate(['..', id], { preserveFragment: true, relativeTo: this.route, state: { savedNew: true } });
    });
  }

  publish() {
    this.service.publish().subscribe(_ =>
      this.router.navigate(['..'], { relativeTo: this.route })
    );
  }

  back() {
    this.service.back();
  }

  next() {
    this.service.next();
  }

}
