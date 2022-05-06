import { Component, OnInit } from '@angular/core';
import { Enterprise, standards } from '@domain/enterprises/enterprise-domain';
import { ActivatedRoute, Router } from '@angular/router';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { DialogService } from '@domain/dialog.service';
import { ContactDialogComponent } from '@domain/contacts/contact-dialog/contact-dialog.component';
import { AuthService } from '@root/app/auth/auth.service';
import { EnterpriseWatchlistService } from '@domain/enterprises/enterprise-watchlist.service';

@Component({
  selector: 'app-enterprise-details',
  templateUrl: './enterprise-details.component.html',
  styleUrls: ['./enterprise-details.component.scss']
})
export class EnterpriseDetailsComponent implements OnInit {
  standards = standards;
  enterprise: Enterprise;
  logoLoaded = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private service: EnterpriseService,
    public watchlist: EnterpriseWatchlistService,
    private dialog: DialogService,
    public auth: AuthService) { }

  getStandardLabel(code: string) {
    return this.standards.find(s => s.code === code).label;
  }

  ngOnInit() {
    this.route.fragment.pipe(
      filter(frag => frag === 'contact-form'),
      switchMap(_ => this.auth.isAuthenticated$),
      tap(logged => !logged && this.auth.login()),
      switchMap(_ => this.auth.userProfile$),
      switchMap(profile => this.dialog.open(
        ContactDialogComponent,
        {
          data: profile,
          width: '400px'
        }
      ).afterClosed())
    ).subscribe(msg => {
      if (msg) {
        this.service.sendMessage(this.enterprise.id, msg)
          .pipe(
            switchMap(_ => this.dialog.infoDialog('Message sent', 'Your message was successfully sent to the company manager.'))
          )
          .subscribe();
      }
      this.router.navigate([], { fragment: undefined });
    });

    this.route.paramMap.pipe(
      switchMap(map => this.service.getEnterprise(map.get('enterpriseId'))),
    ).subscribe(enterprise => this.enterprise = enterprise);
  }

  report() {
    this.dialog.inputDialog('Report inapropriate content', '', 'Describe report reason')
      .subscribe(res => {
        if (res && res[0] && !!res[1]) {
          this.service.reportEnterprise(this.enterprise.id, res[1]).subscribe();
        }
      });
  }
}
