import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '@domain/applications/application.service';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '@domain/categories/category.service';
import { switchMap } from 'rxjs/operators';
import { allDetails, Application } from '@domain/applications/application-domain';
import { DialogService } from '@domain/dialog.service';
import { Category } from '@domain/categories/category-domain';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss']
})
export class ApplicationDetailsComponent implements OnInit {
  app: Application;
  mainCategory: Category;
  category: Category;

  hasDetails = false;

  constructor(private service: ApplicationService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private dialogService: DialogService

  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params =>
        this.service.getApplication(params.get('applicationId'))
      )
    ).subscribe(app => {
      this.app = app;
      this.hasDetails = Object.keys(this.app.details ?? {}).length > 0;
      this.categoryService.byId$(app.mainCategoryId).subscribe(c => this.mainCategory = c);
      this.categoryService.byId$(app.categoryId).subscribe(c => this.category = c);
    });
  }

  getDetailByCode(code) {
    return allDetails.find(d => d.code === code) || { code, name: code };
  }

  reportClicked() {
    this.dialogService.inputDialog('Report inapropriate content', '', 'Describe report reason')
      .subscribe(res => {
        if (res && res[0] && !!res[1]) {
          this.service.reportApplication(this.app.id, res[1]).subscribe();
        }
      });
  }

}
