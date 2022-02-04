import { Component, OnInit } from '@angular/core';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Invitation } from '@domain/enterprises/enterprise-domain';
import { AuthService } from '@root/app/auth/auth.service';

@Component({
  selector: 'app-enterprise-invite',
  templateUrl: './enterprise-invite.component.html',
  styleUrls: ['./enterprise-invite.component.scss']
})
export class EnterpriseInviteComponent implements OnInit {

  invitation: Invitation = {} as any;
  state = '';

  constructor(private service: EnterpriseService, private route: ActivatedRoute, public auth: AuthService, public router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => this.service.getInvitationDetails(id))
    ).subscribe(
      data => {
        this.invitation = data;
        this.state = 'ok';
      },
      () => {
        this.state = 'error';
      }
    );
  }
}
