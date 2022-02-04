import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Attachment } from '@domain/attachments/attachment.domain';
import { DialogService } from '@domain/dialog.service';
import { Enterprise, KeyProject } from '@domain/enterprises/enterprise-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { filter, switchMap } from 'rxjs/operators';
import { ContactItem, Location } from '@domain/common-domain';

@Component({
  selector: 'app-enterprise-details',
  templateUrl: './enterprise-details.component.html',
  styleUrls: ['./enterprise-details.component.scss']
})
export class EnterpriseDetailsComponent implements OnInit {
  pending: Enterprise;
  published: Enterprise;
  categoriesChanged = false;

  constructor(private route: ActivatedRoute,
    private service: EnterpriseService,
    private dialogService: DialogService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params =>
        this.service.getAdminEnterprise(params.get('enterpriseId'))
      )
    ).subscribe(({ pending, published }) => {
      this.pending = pending;
      this.published = published;
      this.categoriesChanged = published && JSON.stringify(published.categoryIds) !== JSON.stringify(pending.categoryIds);
    });
  }

  publish() {
    this.service.changeAdminEnterpriseStatus(this.pending.id, 'publish')
      .subscribe(_ => {
        this.router.navigate(['..'], { relativeTo: this.route });
      });
  }

  reject() {
    this.dialogService.inputDialog('Reject reason',
      'Please specify details about rejection reason for the company profile manager.',
      'Rejection reason')
      .pipe(
        filter(res => res && res[0] && !!res[1]),
        switchMap(([_, msg]) => this.service.changeAdminEnterpriseStatus(this.pending.id, 'reject', msg)),
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

  keyProjectText(item?: KeyProject) {
    return [
      item?.title,
      this.locationText(item?.location),
      item?.webPage,
      item?.description,
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
