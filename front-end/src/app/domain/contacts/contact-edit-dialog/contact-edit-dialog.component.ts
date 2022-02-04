import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact, ContactItem } from '@domain/common-domain';

@Component({
  selector: 'app-contact-edit-dialog',
  templateUrl: './contact-edit-dialog.component.html',
  styleUrls: ['./contact-edit-dialog.component.scss']
})
export class ContactEditDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public item: ContactItem) {
    if (!this.item.elements) {
      this.item.elements = [];
      this.addElement();
    }
  }

  ngOnInit(): void {
  }

  addElement() {
    this.item.elements.push({} as Contact);
  }

  removeElement(idx: number) {
    this.item.elements.splice(idx, 1);
    if (this.item.elements.length == 0) {
      this.addElement();
    }
  }

  isValid() {
    return this.item.elements.filter(el => !!el.type && !!el.value).length > 0;
  }

}
