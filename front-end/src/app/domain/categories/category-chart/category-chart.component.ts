import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input,
  OnChanges, OnInit, Output, ViewChild, ViewEncapsulation
} from '@angular/core';
import { CategoryService } from '../category.service';
import { select } from 'd3-selection';
import { OrgChart } from 'd3-org-chart';
import { Category } from '../category-domain';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-category-chart',
  templateUrl: './category-chart.component.html',
  styleUrls: ['./category-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoryChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chartContainer')
  chartContainer: ElementRef;

  chart: OrgChart<any>;
  private categories: Category[] = [];
  private categoryIds$ = new BehaviorSubject<string[]>([]);
  private showAllCategories$ = new BehaviorSubject(false);

  @Input()
  set categoryIds(list: string[]) {
    this.categoryIds$.next(list);
  }

  @Input()
  chartHeight: number = window.innerHeight - 250;

  @Input()
  expandAllOnInit = false;

  @Input()
  set showAllCategories(val: boolean) {
    this.showAllCategories$.next(val);
  };

  @Output()
  categorySelected = new EventEmitter<string>();

  constructor(private service: CategoryService) { }

  ngOnInit(): void {
    combineLatest([this.service.all$, this.categoryIds$, this.showAllCategories$])
      .subscribe(([all, ids, showAll]) => {
        if (showAll) {
          this.categories = all;
        }
        if (ids?.length) {
          const categories = all.filter(c => ids.includes(c.id));
          const missingParents = categories
            .map(c => c.parentId)
            .filter(p => !!p && !categories.find(c => c.id === p));


          if (missingParents.length > 0) {
            console.warn('Missing categories', missingParents);
          }

          this.categories = categories.filter(c => !missingParents.includes(c.parentId));
        }
        this.updateChart();
      });
  }

  ngAfterViewInit() {
    if (!this.chart) {
      this.chart = new OrgChart();
    }
    this.updateChart();
  }

  ngOnChanges() {
    this.updateChart();
  }

  updateChart() {
    if (!this.chart || !this.chartContainer || !this.categories?.length) {
      return;
    }

    const rootIds = this.categories.filter(c => !c.parentId).map(c => c.id);

    this.chart.container(this.chartContainer.nativeElement)
      .data([{ id: 'root' }, ...this.categories.map(c => ({ ...c, _expanded: rootIds.includes(c.parentId) }))])
      .nodeId(node => node.id)
      .parentNodeId(node => node.id === 'root' ? null : node.parentId || 'root')
      .svgHeight(this.chartHeight)
      .nodeHeight(node => {
        if (node.id === 'root') {
          return 0;
        } else if (node.data._totalSubordinates > 0 || node.children?.length) {
          return 200;
        } else {
          return 180;
        }
      })
      .nodeWidth(node => node.id === 'root' ? 0 : 270)
      .rootMargin(0)
      .compactMarginBetween(() => 40)
      .siblingsMargin(() => 40)
      .nodeContent(node => {
        if (node.id === 'root') {
          return '<div style="display: none;">ROOT</div>';
        }

        const avatar = node.data.imageUrl ? `<img src="${node.data.imageUrl}">` : '';
        const subCount = node.data._totalSubordinates > 0 ? `<p>${node.data._totalSubordinates} subcategories</p>` : '';

        return `<div class="category-chart__node">
          ${avatar}
          <h3>${node.data.title}</h3>
          ${subCount}      
        </div>`;
      })
      .onNodeClick((id: any) => {
        this.chart.clearHighlighting();
        this.chart.setHighlighted(id).setUpToTheRootHighlighted(id).render();
        this.categorySelected.emit(id);
      })
      .buttonContent(({ node }) => {
        if (node.id === 'root') {
          return '';
        }
        const icon = node.children ? 'fa-chevron-up' : 'fa-chevron-down';
        return `<div class="category-chart__button">
        <i class="fa ${icon}"></i>
        </div>`;
      })
      // eslint-disable-next-line space-before-function-paren
      .nodeUpdate(function (node: any) {
        const selected = node.data._highlighted || node.data._upToTheRootHighlighted;
        select(this)
          .select('.node-rect')
          .attr('stroke', selected ? '#452f74' : '#999999')
          .attr('stroke-width', selected ? 3 : 1);
      })
      // eslint-disable-next-line space-before-function-paren
      .linkUpdate(function (node) {
        if (node.parent.id === 'root') {
          return;
        }

        const selected = node.data._highlighted || node.data._upToTheRootHighlighted;

        select(this)
          .attr('stroke', selected ? '#452f74' : '#999999')
          .attr('stroke-width', selected ? 3 : 1);
      })
      .render();

    if (this.expandAllOnInit) {
      this.chart.expandAll();
    }

    this.chart.fit();
  }

  fit() {
    this.chart.fit();
  }

  expandAll() {
    this.chart.expandAll();
    this.chart.fit();
  }

  collapseAll() {
    this.chart.collapseAll();
    this.chart.expandLevel(1).render().fit();
  }

}
