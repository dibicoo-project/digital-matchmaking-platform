import { Component, OnInit } from '@angular/core';
import { Enterprise } from '@domain/enterprises/enterprise-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '@domain/dialog.service';

@Component({
  selector: 'app-enterprise-list',
  templateUrl: './enterprise-list.component.html',
  styleUrls: ['./enterprise-list.component.scss']
})
export class EnterpriseListComponent implements OnInit {
  selectedTab = null;

  publishedEnteprises: Enterprise[];
  draftEnteprises: Enterprise[];

  constructor(private service: EnterpriseService, private route: ActivatedRoute,
    private router: Router, private dialog: DialogService) { }

  private loadCompanies() {
    this.service.getUserEnterprises().subscribe(({ published, drafts }) => {
      this.publishedEnteprises = published;
      this.draftEnteprises = drafts;
    });
  }

  ngOnInit() {
    this.loadCompanies();

    this.route.fragment.subscribe(f => {
      this.selectedTab = f;
    });
  }

  tabChanged(tab: number) {
    this.selectedTab = tab;
    this.router.navigate([], { fragment: tab?.toString() });
  }

  getCardClass(item: Enterprise) {
    if (item.pendingReview) {
      return 'pending';
    } else if (item.rejectReason) {
      return 'rejected';
    } else {
      return 'draft';
    }
  }

  unpublish(company: Enterprise) {
    this.dialog.confirmDialog('Unpublish Confirmation', `Are you sure you want to unpublish this company profile?`)
      .subscribe(([ok]) => {
        if (ok) {
          this.service.changeEnterpriseStatus(company.id, 'unpublish')
            .subscribe(() => this.loadCompanies());
        }
      });
  }

  delete(company: Enterprise) {
    this.dialog.confirmDialog('Delete Confirmation', `Are you sure you want to delete [${company.companyName}] company profile?
    This operation is not reversible and will also delete published version of this company profile.`)
      .subscribe(([ok]) => {
        if (ok) {
          this.service.deleteEnterprise(company.id)
            .subscribe(() => this.loadCompanies());
        }
      });
  }

}
