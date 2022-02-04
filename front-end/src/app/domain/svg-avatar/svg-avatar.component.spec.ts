import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SvgAvatarComponent } from './svg-avatar.component';

describe('SvgAvatarComponent', () => {
  let component: SvgAvatarComponent;
  let fixture: ComponentFixture<SvgAvatarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set parameters from title', () => {
    component.title = 'Testting , message / with - different _$ characters';

    expect(component.defaultText).toEqual('TMW');
    expect(component.backColor).toEqual('hsl(113, 50%, 70%)');
    expect(component.textColor).toEqual('hsl(113, 10%, 95%)');
  });

  it('should handle null title', () => {
    component.title = null;

    expect(component.defaultText).toEqual('');
    expect(component.backColor).toEqual('hsl(0, 50%, 70%)');
    expect(component.textColor).toEqual('hsl(0, 10%, 95%)');
  });
});
