import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-multiline-text',
  styles: [' p { max-width: 60em;}'],
  templateUrl: './multiline-text.component.html'
})
export class MultilineTextComponent implements OnInit {

  @Input()
  value: string;

  get lines() {
    return this.value?.split(/\n+/g);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
