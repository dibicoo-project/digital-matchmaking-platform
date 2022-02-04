import { Component, OnInit } from '@angular/core';
import { Category } from '@domain/categories/category-domain';
import { CategoryService } from '@domain/categories/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, tap, mergeMap } from 'rxjs/operators';
import { of, combineLatest, forkJoin } from 'rxjs';
import { DialogComponent } from '@domain/dialog/dialog.component';

@Component({
  selector: 'app-categories-edit-details',
  templateUrl: './categories-edit-details.component.html',
  styleUrls: ['./categories-edit-details.component.scss']
})
export class CategoriesEditDetailsComponent implements OnInit {

  category: Category = null;
  title: string;
  // For image upload and preview
  selectedFile: File;
  imgPreviewUrl: any;

  constructor(
    private service: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    const ancestors$ = (parentId: string) => this.service.getCategory(parentId)
      .pipe(
        mergeMap(data => forkJoin([
          ...(data.ancestors || []).map(id => this.service.getCategory(id)),
          of(data),
        ]))
      );

    combineLatest([this.route.data, this.route.paramMap])
      .pipe(
        switchMap(([data, paramMap]) => {
          const id = paramMap.get('categoryId');
          if (data.isNew) {
            return of({ parentId: id } as Category);
          } else {
            return this.service.getCategory(id);
          }
        })
      ).subscribe(cat => {
        this.category = cat;
        this.title = cat.title;
        this.imgPreviewUrl = cat.imageUrl;

        if (cat.parentId) {
          ancestors$(cat.parentId).subscribe(list => {
            cat.ancestorCategories = list;
            cat.ancestors = list.map(i => i.id);
          });
        }
      });
  }

  onImgChanged(event: any) {
    // get file
    this.selectedFile = event.target.files[0] as File;

    // get image as base64 string
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      this.imgPreviewUrl = reader.result;
    };
  }

  doSave() {
    const data = this.category;
    const save$ = data.id ? this.service.editCategory(data.id, data) : this.service.addCategory(data);

    save$.pipe(
      switchMap(cat => {
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('image', this.selectedFile, this.selectedFile.name);
          return this.service.uploadImage(cat.id, formData);
        } else {
          return of(null);
        }
      })
    ).subscribe(() => {
      this.router.navigate(['/admin/categories']);
    });
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      restoreFocus: false, // so that there is no focus on Delete button after closing dialog
      position: { top: '20%' },
      data: {
        dialogType: 'confirm',
        title: 'Delete Confirmation',
        content: 'Are you sure you want to delete this category including all its subcategories?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.deleteCategory(this.category.id).subscribe(() => {
          this.router.navigate(['/admin/categories']);
        });
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/admin/categories']);
  }
}
