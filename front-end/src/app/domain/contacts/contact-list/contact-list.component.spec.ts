import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ContactItem } from '@domain/common-domain';
import { AuthService } from '@root/app/auth/auth.service';
import { EMPTY, empty, of } from 'rxjs';
import { ContactsService } from '../contacts.service';

import { ContactListComponent } from './contact-list.component';

describe('ContactListComponent', () => {
  let component: ContactListComponent;
  let fixture: ComponentFixture<ContactListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContactListComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: () => EMPTY
          }
        },
        {
          provide: ContactsService,
          useValue: {
            all$: EMPTY
          }
        },
        {
          provide: AuthService,
          useValue: {
            userProfile$: EMPTY
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add new contact item', () => {
    const newItem = {
      name: 'test name',
      elements: [
        { value: 'only value' },
        { type: 'other' },
        { type: 'phone', value: '123' }
      ]
    } as ContactItem;

    const dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(newItem) } as any);

    component.addContact();
    expect(component.contacts[0].name).toBe('test name');
    expect(component.contacts[0].elements.length).toBe(1);
  });

  it('should edit contact item', () => {
    const item = {
      name: 'test name',
      elements: [
        { type: 'phone', value: '123' }
      ]
    } as ContactItem;

    component.contacts = [item];

    const dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ ...item, name: 'new name' }) } as any);

    component.editContact(0, item);
    expect(component.contacts[0].name).toBe('new name');
  });

  it('should select existing contact item', () => {
    component.contacts = [];

    const dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ name: 'test item' }) } as any);

    component.selectContact(null);
    expect(component.contacts[0].name).toBe('test item');
  });

  it('should remove contact item', () => {
    component.contacts = [
      { name: 'one' } as ContactItem,
      { name: 'two' } as ContactItem,
      { name: 'three' } as ContactItem,
    ];

    component.removeContact(1);
    expect(component.contacts[0].name).toBe('one');
    expect(component.contacts[1].name).toBe('three');
  });
});
