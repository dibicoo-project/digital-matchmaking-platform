import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss']
})
export class ContactDialogComponent implements OnInit {

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.maxLength(255)]],
    message: ['', [Validators.required, Validators.maxLength(1024)]]
  });

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private profile: any) {
  }

  ngOnInit(): void {
    this.form.setValue({
      name: this.profile.name,
      email: this.profile.email,
      message: ''
    });
  }

}
