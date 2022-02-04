import { Component, OnInit } from '@angular/core';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-enterprise-invite',
  templateUrl: './enterprise-invite.component.html',
  styleUrls: ['./enterprise-invite.component.css']
})
export class EnterpriseInviteComponent implements OnInit {

  constructor(private service: EnterpriseService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => !!id),
      switchMap(id => this.service.acceptInvitation(id))
    ).subscribe(_ => {
        this.router.navigate(['/user/enterprises/']);
    });
  }

}
