import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TourComponent } from './tour.component';

describe('TourComponent', () => {
  let component: TourComponent;
  let fixture: ComponentFixture<TourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourComponent],
      imports: [RouterTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start tour', () => {
    // create fake element for the tour
    const div = document.createElement('div');
    div.classList.add('test');
    document.querySelector('body').appendChild(div);

    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data.tour = [{ intro: 'Lorem', element: '.test' }];

    component.startTour();

    const overlay = document.querySelector('.introjs-overlay');
    expect(overlay).toBeTruthy();
  });
});
