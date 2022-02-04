import { Component, OnInit } from '@angular/core';
import { Application } from '@domain/application-domain';
import { ApplicationService } from '@domain/application.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@domain/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
  pending: Application[] = [];
  reported: Application[] = [];
  published: Application[] = [];
  selectedTab = null;

  constructor(private service: ApplicationService, private route: ActivatedRoute, private router: Router,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.fetch();
    this.route.fragment.subscribe(val => {
      this.selectedTab = val;
    });
  }

  private fetch() {
    this.service.getAdminApplications()
      .subscribe(({ pending, published }) => {
        this.pending = pending;
        this.published = published;
        this.reported = published.filter(app => app.reports?.length);
      });
  }

  tabChanged(tab: number) {
    this.selectedTab = tab;
    this.router.navigate([], { fragment: tab?.toString() });
  }

  reportsClicked(dialog: any, app: Application) {
    this.matDialog.open(dialog, {
      position: { top: '20%' },
      data: app.reports?.sort((a, b) => a.ts > b.ts ? -1 : 1)
    });
  }

  unpublish(id: string) {
    this.dialogService.inputDialog('Unpublish reason',
      'Please specify details about unpublishing reason for the business opportunity author.',
      'Unpublishing reason')
      .pipe(
        filter(res => res && res[0] && !!res[1]),
        switchMap(([_, msg]) => this.service.changeAdminApplicationStatus(id, 'unpublish', msg)),
      )
      .subscribe(_ => {
        this.fetch();
      });
  }

}
