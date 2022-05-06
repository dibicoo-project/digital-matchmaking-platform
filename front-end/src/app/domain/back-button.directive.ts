import { Location } from '@angular/common';
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appBackButton]'
})
export class BackButtonDirective {

  constructor(private location: Location) { }

  @HostListener('click')
  click() {
    this.location.back();
  }
}
