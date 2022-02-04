import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ContactItem } from '@domain/common-domain';
import { AuthService } from '@root/app/auth/auth.service';
import * as clone from 'clone';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
import { ContactEditDialogComponent } from '../contact-edit-dialog/contact-edit-dialog.component';
import { ContactsService } from '../contacts.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContactListComponent),
      multi: true
    }
  ]
})
export class ContactListComponent implements OnInit, ControlValueAccessor {

  @Input()
  readonly = false;

  @Input()
  required: boolean;

  constructor(private dialog: MatDialog,
    public service: ContactsService,
    private auth: AuthService) { }

  contacts: ContactItem[] = [];

  public profile$ = this.auth.userProfile$.pipe(
    map(p => ({ name: p.name, elements: [{ type: 'email', value: p.email }] }))
  );

  ngOnInit(): void {
  }

  private openDialog(item: ContactItem) {
    const data = clone(item);
    const ref = this.dialog.open(ContactEditDialogComponent, { width: '50rem', data });


    return (ref.afterClosed() as Observable<ContactItem>).pipe(
      filter(res => !!res),
      tap(res => res.elements = res.elements.filter(el => !!el.type && !!el.value))
    );
  }

  addContact() {
    this.openDialog({} as ContactItem).subscribe(res => {
      this.contacts.push(res);
      this.onChange(this.contacts);
      this.onTouched();
    });
  }

  selectContact(template: any) {
    this.dialog.open(template, { autoFocus: false }).afterClosed()
      .subscribe(res => {
        if (res) {
          this.contacts.push(res);
          this.onChange(this.contacts);
          this.onTouched();
        }
      });
  }

  editContact(idx: number, item: ContactItem) {
    this.openDialog(item).subscribe(res => {
      this.contacts[idx] = { ...res };
      this.onChange(this.contacts);
      this.onTouched();
    });
  }

  removeContact(idx: number) {
    this.contacts.splice(idx, 1);
    this.onChange(this.contacts);
    this.onTouched();
  }

  private onChange: any = () => { };
  private onTouched: any = () => { };

  writeValue(obj: ContactItem[]): void {
    if (Symbol.iterator in Object(obj)) {
      this.contacts = [...obj];
    } else {
      this.contacts = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  contactText(item: ContactItem) {
    return [
      item.name,
      item.department,
      ...item.elements
        .filter(e => e.type === 'phone' || e.type === 'email')
        .map(e => e.value)
    ].filter(i => !!i).join(', ');
  }
}
