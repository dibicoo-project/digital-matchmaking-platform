import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FgpComponent } from './fgp.component';

describe('FgpComponent', () => {
  let component: FgpComponent;
  let fixture: ComponentFixture<FgpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FgpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FgpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
