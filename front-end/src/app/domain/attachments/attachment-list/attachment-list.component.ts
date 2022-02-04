import { Component, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@domain/dialog.service';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { Attachment } from '../attachment.domain';
import { AttachmentEditDialogComponent } from '../attachment-edit-dialog/attachment-edit-dialog.component';

@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AttachmentListComponent),
      multi: true
    }
  ]
})
export class AttachmentListComponent implements OnInit, ControlValueAccessor {

  maxItems = 5;

  allowedMimeTypes = [
    // images
    'image/jpeg',
    'image/png',
    // documents
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    // spreadsheets
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    // other
    'application/pdf'
  ];

  attachments: Attachment[];

  @Input()
  readonly = false;

  constructor(private dialog: DialogService) { }

  ngOnInit(): void {
  }

  private onChange: any = (val) => { };

  writeValue(obj: any): void {
    if (Symbol.iterator in Object(obj)) {
      this.attachments = [...obj];
    } else {
      this.attachments = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

  @ViewChild('fileInput')
  fileInput: ElementRef;

  private openDialog(item: Attachment, file: File) {
    const ref = this.dialog.open(AttachmentEditDialogComponent, { width: '50rem', data: { item, file } });

    return (ref.afterClosed() as Observable<Attachment | any>).pipe(
      filter(res => !!res),
      switchMap(res => {
        if (res.error) {
          this.uploadErrorMessage(res.error.message);
          return EMPTY;
        } else {
          return of(res);
        }
      })
    );
  }

  private uploadErrorMessage(msg: string) {
    this.dialog.infoDialog('File upload error', msg);
  }

  addItem() {
    const input = this.fileInput.nativeElement;

    input.value = null;
    input.onchange = () => {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.uploadErrorMessage('Selected file is too large to upload. The maximum supported file size is 5 MB.');
        return;
      }
      this.openDialog(null, file).subscribe(res => {
        this.attachments.push(res);
        this.onChange(this.attachments);
      });
    };

    input.click();
  }

  editItem(idx: number) {
    this.openDialog(this.attachments[idx], null).subscribe(res => {
      this.attachments[idx] = res;
      this.onChange(this.attachments);
    });
  }

  removeItem(idx) {
    this.attachments.splice(idx, 1);
    this.onChange(this.attachments);
  }
}
