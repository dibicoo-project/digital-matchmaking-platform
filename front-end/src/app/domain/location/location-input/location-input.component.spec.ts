import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CountrySelectComponent } from '@domain/countries/country-select/country-select.component';
import { MockComponentWithValueAccessor } from '@root/test-utils';

import { LocationInputComponent } from './location-input.component';

describe('LocationInputComponent', () => {
  let component: LocationInputComponent;
  let fixture: ComponentFixture<LocationInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LocationInputComponent,
        MockComponentWithValueAccessor({ selector: 'app-country-select' })
      ],
      imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, NoopAnimationsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate', () => {
    component.writeValue(null);
    expect(component.validate()).not.toBeNull();

    component.writeValue({ city: 'Test city' });
    expect(component.validate()).not.toBeNull();

    component.writeValue({ country: 'Latvia' });
    expect(component.validate()).toBeNull();
  });
});
