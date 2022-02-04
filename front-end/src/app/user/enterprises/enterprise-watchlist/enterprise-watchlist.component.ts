import { Component, OnInit } from '@angular/core';
import { EnterpriseWatchlistService } from '@domain/enterprises/enterprise-watchlist.service';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-enterprise-watchlist',
  templateUrl: './enterprise-watchlist.component.html',
  styleUrls: ['./enterprise-watchlist.component.scss']
})
export class EnterpriseWatchlistComponent implements OnInit {

  constructor(private service: EnterpriseService, private watchlist: EnterpriseWatchlistService) { }

  companies$ = combineLatest([
    this.service.public$,
    this.watchlist.all$
  ]).pipe(
    map(([all, watched]) => all?.filter(c => watched.includes(c.id)))
  );

  ngOnInit(): void {
    this.service.fetchPublic();
  }

}
