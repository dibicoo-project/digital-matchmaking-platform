import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';

@Directive({
  selector: '[appScrollToInvalidControl]'
})
export class ScrollToInvalidControlDirective {

  constructor(
    private ref: ElementRef,
    private formGroupDir: FormGroupDirective
  ) { }

  @HostListener("ngSubmit")
  onSubmit() {
    if (this.formGroupDir.control.invalid) {
      this.scrollToFirstError();
    }
  }

  private scrollToFirstError() {
    const control: HTMLElement = this.ref.nativeElement.querySelector(".ng-invalid");
    const topOffset = 100;
    const top = control.getBoundingClientRect().top + window.scrollY - topOffset;

    window.scroll({
      top,
      behavior: "smooth"
    });

    fromEvent(window, "scroll").pipe(
      debounceTime(100),
      take(1)
    ).subscribe(() => {
      let el: HTMLElement = control.querySelector(".mat-input-element.ng-invalid")
        || control.querySelector(".mat-select.ng-invalid")
        || control;

      if (el) {
        el.focus();
      }
    });
  }
}
