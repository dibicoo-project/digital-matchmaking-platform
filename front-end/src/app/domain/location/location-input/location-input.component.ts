import { Component, forwardRef, OnInit } from '@angular/core';
import {
  ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR,
  ValidationErrors, Validator, Validators
} from '@angular/forms';

@Component({
  selector: 'app-location-input',
  templateUrl: './location-input.component.html',
  styleUrls: ['./location-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LocationInputComponent),
      multi: true
    }
  ]
})
export class LocationInputComponent implements OnInit, ControlValueAccessor, Validator {

  private readonly emptyLocation = { country: undefined, city: undefined, zipCode: undefined, address: undefined };

  locationForm = this.fb.group({
    country: [undefined, Validators.required],
    city: [undefined],
    zipCode: [undefined],
    address: [undefined],
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  private onTouched: any = () => { };

  writeValue(obj: any): void {
    this.locationForm.patchValue({ ...this.emptyLocation, ...obj }, { emitEvent: false });
    this.locationForm.updateValueAndValidity({ emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.locationForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.locationForm.disable();
    }
    else {
      this.locationForm.enable();
    };
  }

  validate(): ValidationErrors {
    return this.locationForm.valid ? null : { required: true, message: 'Country is required for the locaton' };
  }

}
