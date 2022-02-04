import { Component, OnInit, Inject } from '@angular/core';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { EnterpriseShare } from '@domain/enterprises/enterprise-domain';

@Component({
  selector: 'app-enterprise-share',
  templateUrl: './enterprise-share.component.html',
  styleUrls: ['./enterprise-share.component.scss']
})
export class EnterpriseShareComponent implements OnInit {

  shares: EnterpriseShare = {} as EnterpriseShare;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: EnterpriseService,
              private dialogService: MatDialog,
              @Inject('ORIGIN') public origin: string
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('enterpriseId')),
      switchMap(id => this.service.getEnterpriseShares(id))
    ).subscribe(data => {
      this.shares = data;
    });
  }

  getInviteLink(id: string) {
    return `${this.origin}/enterprises/invite/${id}`;
  }

  inviteClicked(inviteDialog: any, resultDialog: any) {
    this.dialogService.open(inviteDialog).afterClosed()
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.service.addEnterpriseShare(this.shares.id, { name: res }).pipe(
          switchMap((share) => {
            this.shares.invites.push(share);
            return this.dialogService.open(resultDialog, { data: share }).afterClosed();
          })
        ).subscribe();
      });
  }


  revokeClicked(dialog: any, invite: any) {
    this.dialogService.open(dialog, { data: invite.name }).afterClosed()
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.service.revokeEnterpriseShare(this.shares.id, { invite: invite.id })
          .subscribe(() => {
            this.shares.invites = this.shares.invites.filter(i => i.id !== invite.id);
          });
      });
  }

  removeClicked(dialog: any, owner: any) {
    this.dialogService.open(dialog, {
      data: {
        name: owner.name,
        self: owner.self,
        companyName: this.shares.companyName
      }
    }).afterClosed()
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.service.revokeEnterpriseShare(this.shares.id, { owner: owner.id })
          .subscribe(() => {
            if (owner.self) {
              this.router.navigate(['/user/enterprises']);
            } else {
              this.shares.owners = this.shares.owners.filter(o => o.id !== owner.id);
            }
          });
      });
  }
}
