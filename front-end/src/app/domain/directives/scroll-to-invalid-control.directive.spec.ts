import { ElementRef } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { ScrollToInvalidControlDirective } from './scroll-to-invalid-control.directive';

describe('ScrollToInvalidControlDirective', () => {
  it('should create an instance', () => {
    const directive = new ScrollToInvalidControlDirective(null, null);
    expect(directive).toBeTruthy();
  });

  it('should scroll to first error', () => {
    const spy = jasmine.createSpy('querySelector').and.returnValue(
      {
        getBoundingClientRect: () => ({ top: 123})
      }
    );

    spyOn(window, 'scroll');

    const directive = new ScrollToInvalidControlDirective(
      { nativeElement: { querySelector: spy } } as ElementRef,
      { control: { invalid: true } } as FormGroupDirective
    );

    directive.onSubmit();

    expect(spy).toHaveBeenCalledWith('.ng-invalid');
    expect(window.scroll as any).toHaveBeenCalledWith({ top: 23, behavior: 'smooth'});
  });
});
