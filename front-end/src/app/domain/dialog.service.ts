import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';

@Injectable()
export class DialogService {

  private config = {
    width: '400px',
    restoreFocus: false, // so that there is no focus on Delete button after closing dialog
    position: { top: '20%' }
  };

  constructor(public dialog: MatDialog) { }

  open<T, D = any, R = any>(component: ComponentType<T>, config?: MatDialogConfig<D>): MatDialogRef<T, R> {
    return this.dialog.open(component, config);
  }

  confirmDialog(title: string, content: string): Observable<any> {
    const dialogRef = this.dialog.open(DialogComponent, {
      ...this.config,
      data: {
        dialogType: 'confirm',
        title,
        content
      }
    });

    return dialogRef.afterClosed();
  }

  inputDialog(title: string, content: string, inputFieldLabel: string, inputValue: string = ''): Observable<any> {
    const dialogRef = this.dialog.open(DialogComponent, {
      ... this.config,
      data: {
        dialogType: 'input',
        title,
        content,
        inputFieldLabel,
        inputValue
      }
    });

    return dialogRef.afterClosed();
  }

  infoDialog(title: string, content: string): Observable<any> {
    const dialogRef = this.dialog.open(DialogComponent, {
      ...this.config,
      data: {
        dialogType: 'info',
        title,
        content
      }
    });

    return dialogRef.afterClosed();
  }
}
