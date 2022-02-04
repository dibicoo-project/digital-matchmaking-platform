import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { map, switchMap } from 'rxjs/operators';

interface StatisticsItem {
  country?: string;
  weeklyUsers?: number;
  weeklyViews?: number;
  monthlyUsers?: number;
  monthlyViews?: number;
}

const sum = (arr, mapFn: (o: any) => any) => arr.reduce((s, i) => s + (mapFn(i) || 0), 0);

@Component({
  selector: 'app-enterprise-statistics',
  templateUrl: './enterprise-statistics.component.html',
  styleUrls: ['./enterprise-statistics.component.scss']
})
export class EnterpriseStatisticsComponent implements OnInit, AfterViewInit {

  columns = ['country', 'weeklyUsers', 'weeklyViews', 'monthlyUsers', 'monthlyViews'];
  companyName: string;
  dataSource: MatTableDataSource<StatisticsItem[]> = new MatTableDataSource([]);
  totals: StatisticsItem = {};

  constructor(private route: ActivatedRoute, private service: EnterpriseService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('enterpriseId')),
      switchMap(id => this.service.getEnterpriseStatistics(id))
    ).subscribe(({ companyName, items }) => {
      this.companyName = companyName;

      if (items) {
        this.totals.weeklyUsers = sum(items, i => i.weeklyUsers);
        this.totals.weeklyViews = sum(items, i => i.weeklyViews);
        this.totals.monthlyUsers = sum(items, i => i.monthlyUsers);
        this.totals.monthlyViews = sum(items, i => i.monthlyViews);
        this.dataSource = new MatTableDataSource(items);
        this.dataSource.sort = this.sort;
      }
    });
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
