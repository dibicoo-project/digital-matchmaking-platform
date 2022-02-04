import { Component, OnInit, Input } from '@angular/core';
import { Enterprise } from '@domain/enterprises/enterprise-domain';
import { EnterpriseWatchlistService } from '../enterprise-watchlist.service';

@Component({
  selector: 'app-enterprise-card',
  templateUrl: './enterprise-card.component.html',
  styleUrls: ['./enterprise-card.component.scss']
})
export class EnterpriseCardComponent implements OnInit {
  enterprise: Enterprise;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('enterprise')
  set value(val: Enterprise) {
    this.enterprise = { location: {}, ...val };
    this.enterprise.location.zipCode = undefined;
    this.enterprise.location.address = undefined;
  }

  @Input()
  cardClass: string;

  logoLoaded = false;

  constructor(public watchlist: EnterpriseWatchlistService) { }

  ngOnInit(): void {
  }

}
