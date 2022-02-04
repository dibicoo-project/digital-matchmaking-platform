import { Component, forwardRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CountriesService } from '../countries.service';
import { Country } from '../country-domain';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { onlyUnique } from '@domain/utils';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountrySelectComponent),
      multi: true
    }
  ]
})
export class CountrySelectComponent implements OnInit, ControlValueAccessor {

  inputControl = new FormControl('');
  filteredCountries$: Observable<Country[]>;

  @Input() label = 'Country';

  @Input()
  hint: string;

  @Input()
  required: boolean;

  @Output()
  optionSelected = new EventEmitter<MatAutocompleteSelectedEvent>();

  constructor(private service: CountriesService) {
  }

  ngOnInit(): void {
    const term$ = this.inputControl.valueChanges.pipe(
      startWith(''),
      debounceTime(150),
      distinctUntilChanged()
    );

    const doSearch = (all: Country[], reg: RegExp, fn: (c: Country) => any) => all.filter(c => reg.test(fn(c)));

    this.filteredCountries$ = combineLatest([term$, this.service.all$]).pipe(
      map(([term, all]) => {
        try {
          const query = term.split(/[\W\s]+/).map(t => `(?=.*${t}.*)`).join('');
          const reg = new RegExp(query, 'i');

          return [
            ...doSearch(all, reg, (c) => c.cca2),
            ...doSearch(all, reg, (c) => c.name),
            ...doSearch(all, reg, (c) => c.altSpellings),
          ].filter(onlyUnique);
        } catch (err) {
          return all;
        }
      })
    );
  }

  onTouched: any = () => { };

  writeValue(obj: any): void {
    this.inputControl.setValue(obj, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.inputControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable();
    }
  }

}
