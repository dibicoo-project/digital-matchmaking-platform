import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SvgAvatarComponent } from '@domain/svg-avatar/svg-avatar.component';

import { ImageAvatarComponent } from './image-avatar.component';

describe('ImageAvatarComponent', () => {
  let component: ImageAvatarComponent;
  let fixture: ComponentFixture<ImageAvatarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageAvatarComponent, SvgAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
