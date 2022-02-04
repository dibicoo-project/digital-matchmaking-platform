import { Component, OnInit } from '@angular/core';
import { Enterprise } from '@domain/enterprises/enterprise-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { DialogService } from '@domain/dialog.service';

@Component({
  selector: 'app-enterprise-list',
  templateUrl: './enterprise-list.component.html',
  styleUrls: ['./enterprise-list.component.scss']
})
export class EnterpriseListComponent implements OnInit {
  pending: Enterprise[];
  reported: Enterprise[];
  published: Enterprise[];
  selectedTab = null;

  constructor(private service: EnterpriseService, private route: ActivatedRoute,
    private router: Router, public dialog: DialogService) { }

  ngOnInit() {
    this.fetch();

    this.route.fragment.subscribe(f => {
      this.selectedTab = f;
    });
  }

  private fetch() {
    this.service.getAdminEnterprises().subscribe(({pending, published}) => {
      this.pending = pending;
      this.published = published;
      this.reported = published.filter(one => one.reports?.length > 0);
    });
  }

  tabChanged(tab: number) {
    this.selectedTab = tab;
    this.router.navigate([], { fragment: tab?.toString() });
  }

  reportsClicked(dialog: any, one: Enterprise) {
    this.dialog.open(dialog, {
      position: { top: '20%' },
      data: one.reports?.sort((a, b) => a.ts > b.ts ? -1 : 1)
    });
  }

  unpublish(id: string) {
    this.dialog.inputDialog('Unpublish reason',
      'Please specify details about unpublishing reason for the company profile manager.',
      'Unpublishing reason')
      .pipe(
        filter(res => res && res[0] && !!res[1]),
        switchMap(([_, msg]) => this.service.changeAdminEnterpriseStatus(id, 'unpublish', msg)),
      )
      .subscribe(_ => {
        this.fetch();
      });
  }
}
