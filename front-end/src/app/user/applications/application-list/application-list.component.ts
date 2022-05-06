import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '@domain/applications/application.service';
import { Application } from '@domain/applications/application-domain';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@domain/dialog.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
  drafts: Application[] = [];
  published: Application[] = [];
  selectedTab = null;

  constructor(private service: ApplicationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: DialogService) { }

  private loadApplications() {
    this.service.getUserApplications().subscribe(({ drafts, published }) => {
      this.drafts = drafts;
      this.published = published;
    });
  }

  ngOnInit(): void {
    this.loadApplications();
    this.route.fragment.subscribe(val => {
      this.selectedTab = val;
    });
  }

  tabChanged(tab: number) {
    this.selectedTab = tab;
    this.router.navigate([], { fragment: tab?.toString() });
  }

  deleteApplication(app: Application) {
    this.dialog.confirmDialog('Delete Confirmation', `Are you sure you want to delete this business opportunity? 
    This operation is not reversible and will also delete published version of this business opportunity.`)
      .subscribe(([ok]) => {
        if (ok) {
          this.service.deleteApplication(app.id)
            .subscribe(() => this.loadApplications());
        }
      });
  }

  unpublish(app: Application) {
    this.dialog.confirmDialog('Unpublish Confirmation', `Are you sure you want to unpublish this business opportunity?`)
      .subscribe(([ok]) => {
        if (ok) {
          this.service.changeApplicationStatus(app.id, 'unpublish')
            .subscribe(() => this.loadApplications());
        }
      });
  }

  getCardClass(app: Application) {
    if (app.pendingReview) {
      return 'pending';
    } else if (app.rejectReason) {
      return 'rejected';
    } else {
      return 'draft';
    }
  }

}
