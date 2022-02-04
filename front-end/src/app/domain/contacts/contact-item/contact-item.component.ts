import { Component, Input, OnInit } from '@angular/core';
import { Contact, ContactItem } from '@domain/common-domain';

@Component({
  selector: 'app-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrls: ['./contact-item.component.scss']
})
export class ContactItemComponent implements OnInit {

  @Input()
  item: ContactItem;

  get mainElements() {
    return this.item?.elements.filter(el => el.type === 'phone' || el.type === 'email');
  }

  get socialElements() {
    return this.item?.elements.filter(el => el.type !== 'phone' && el.type !== 'email');
  }

  constructor() { }

  ngOnInit(): void {
  }

  url(el: Contact) {
    if (el.type === 'phone') {
      return `tel:${el.value}`;
    } else if(el.type === 'email') {
      return `mailto:${el.value}`;
    } else {
      return /^https?:\/\//.test(el.value) ? el.value : `http://${el.value}`;
    }
  }
}
