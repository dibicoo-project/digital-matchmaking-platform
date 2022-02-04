import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { allDetails, Application } from '@domain/application-domain';
import { ApplicationService } from '@domain/application.service';
import { Attachment } from '@domain/attachments/attachment.domain';
import { Category } from '@domain/categories/category-domain';
import { CategoryService } from '@domain/categories/category.service';
import { ContactItem, Location } from '@domain/common-domain';
import { DialogService } from '@domain/dialog.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss']
})
export class ApplicationDetailsComponent implements OnInit {

  public allDetails = allDetails;
  public allDetailsCodes = allDetails.map(d => d.code);

  pending: Application;
  pendingMainCategory: Category;
  pendingCategory: Category;

  published: Application;
  publishedMainCategory: Category;
  publishedCategory: Category;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ApplicationService,
    private categories: CategoryService,
    private dialogService: DialogService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params =>
        this.service.getAdminApplication(params.get('applicationId'))
      )
    ).subscribe(({ pending, published }) => {
      this.pending = pending;
      this.categories.byId$(pending.mainCategoryId).subscribe(c => this.pendingMainCategory = c);
      this.categories.byId$(pending.categoryId).subscribe(c => this.pendingCategory = c);

      this.published = published;
      if (published) {
        this.categories.byId$(published.mainCategoryId).subscribe(c => this.publishedMainCategory = c);
        this.categories.byId$(published.categoryId).subscribe(c => this.publishedCategory = c);
      }
    });
  }

  publish() {
    this.service.changeAdminApplicationStatus(this.pending.id, 'publish')
      .subscribe(_ => {
        this.router.navigate(['..'], { relativeTo: this.route });
      });
  }

  reject() {
    this.dialogService.inputDialog('Reject reason',
      'Please specify details about rejection reason for the business opportunity author.',
      'Rejection reason')
      .pipe(
        filter(res => res && res[0] && !!res[1]),
        switchMap(([_, msg]) => this.service.changeAdminApplicationStatus(this.pending.id, 'reject', msg)),
      )
      .subscribe(_ => {
        this.router.navigate(['..'], { relativeTo: this.route });
      });
  }

  locationText(item?: Location) {
    return [
      item?.country,
      item?.city,
      item?.address,
      item?.zipCode,
    ].filter(i => !!i).join(', ');
  }

  attachmentText(item?: Attachment) {
    return [
      item?.description,
      item?.fileName,
      item?.id,
    ].filter(i => !!i).join(' | ');
  }

  contactsText(item?: ContactItem) {
    return [
      item?.name,
      item?.department,
      ...item?.elements.map(c => `${c.type}: ${c.value}`) || [],
    ].filter(i => !!i).join(', ');
  }

  range(arr1: any[], arr2: any[]) {
    const len = Math.max(arr1?.length || 0, arr2?.length || 0);
    return [...Array(len).keys()];
  }
}
