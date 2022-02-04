import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Attachment } from '../attachment.domain';
import { AttachmentService } from '../attachment.service';

@Component({
  selector: 'app-attachment-edit-dialog',
  templateUrl: './attachment-edit-dialog.component.html',
  styleUrls: ['./attachment-edit-dialog.component.scss']
})
export class AttachmentEditDialogComponent implements OnInit {
  item: Attachment;
  file: File;

  uploadProgress = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { item: Attachment; file: File },
    private dialogRef: MatDialogRef<AttachmentEditDialogComponent>,
    private service: AttachmentService
  ) {
    this.item = { fileName: data.file?.name, ...data.item };
    this.file = data.file;
  }

  ngOnInit(): void {
  }

  save() {
    if (this.file) {
      this.service.upload(this.file).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            const res = event.body;
            this.item.id = res.id;
            this.dialogRef.close(this.item);
          }
        },
        err => {
          this.dialogRef.close({ error: err.error });
        });
    } else {
      this.dialogRef.close(this.item);
    }
  }

}
