import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { CountriesService } from '../countries.service';

import { CountrySelectComponent } from './country-select.component';

describe('CountrySelectComponent', () => {
  let component: CountrySelectComponent;
  let fixture: ComponentFixture<CountrySelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CountrySelectComponent],
      providers: [
        {
          provide: CountriesService,
          useValue: {
            all$: of([
              { name: 'Test 1', cca2: 't1' },
              { name: 'Test 2', },
              { name: 'Test 3', altSpellings: 'Third test' }
            ])
          }
        }
      ],
      imports: [MatAutocompleteModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountrySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should filter list of countries', () => {

    it('by name', (done) => {
      component.filteredCountries$.subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].name).toEqual('Test 2');
        done();
      });

      component.inputControl.setValue('2');
    });

    it('by alternative spellings', (done) => {
      component.filteredCountries$.subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].name).toEqual('Test 3');
        done();
      });

      component.inputControl.setValue('third');
    });

    it('by alpha2 code', (done) => {
      component.filteredCountries$.subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].name).toEqual('Test 1');
        done();
      });

      component.inputControl.setValue('t1');
    });

  });
});
