import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Category } from '@domain/categories/category-domain';
import { CategoryService } from '@domain/categories/category.service';
import { Router } from '@angular/router';
import { LocalStateService } from '../../local-state.service';

interface FlatNode {
  expandable: boolean;
  title: string;
  level: number;
  id: string;
  ancestors: string[];
}

@Component({
  selector: 'app-categories-edit',
  templateUrl: './categories-edit.component.html',
  styleUrls: ['./categories-edit.component.scss']
})

export class CategoriesEditComponent implements OnInit {
  categories: Category[] = [];
  // For category tree
  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<Category, any>;
  dataSource: MatTreeFlatDataSource<Category, FlatNode>;

  private transformer = (node: Category, lvl: number) => {
    return {
      expandable: (this.getChidren(node).length > 0) ? true : false,
      title: node.title,
      id: node.id,
      imageUrl: node.imageUrl,
      ancestors: node.ancestors,
      level: lvl
    };
  }

  constructor(private service: CategoryService, public router: Router,
              private localState: LocalStateService) {
    this.treeControl = new FlatTreeControl<FlatNode>(
      node => node.level,
      node => node.expandable);

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      node => node.level,
      node => node.expandable,
      node => this.getChidren(node));

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit() {
    this.service.getCategories().subscribe(data => {
      this.categories = data;
      this.dataSource.data = this.categories.filter(c => c.parentId === null);

      const open = this.localState.get('openCategories', {});
      const newOpen = {};
      this.treeControl.dataNodes
        .filter(n => open[n.id])
        .forEach(n => {
          this.treeControl.expand(n);
          newOpen[n.id] = true;
        });

      // remove non-existing open IDs
      this.localState.put('openCategories', newOpen);
    });
  }

  getChidren(node: Category) {
    return this.categories.filter(c => c.parentId === node.id);
  }

  toggleNode(node: FlatNode) {
    const open = this.localState.get('openCategories', {});

    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      open[node.id] = undefined;
    } else {
      this.treeControl.expand(node);
      open[node.id] = true;
    }

    this.localState.put('openCategories', open);
  }
}
