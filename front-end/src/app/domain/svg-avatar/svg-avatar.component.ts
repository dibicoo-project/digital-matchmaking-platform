import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-svg-avatar',
  templateUrl: './svg-avatar.component.svg',
  styleUrls: ['./svg-avatar.component.css'],
})
export class SvgAvatarComponent implements OnInit {

  defaultText = '';
  defaultHue = 126;
  
  @Input()
  text: string;

  @Input()
  hue: number;

  get backColor(): string {
    return `hsl(${this.hue || this.defaultHue}, 50%, 70%)`;
  }

  get textColor(): string {
    return `hsl(${this.hue || this.defaultHue}, 10%, 95%)`;
  }  

  @Input()
  set title(value: string) {
    value = (value || '');
    this.defaultText = value.split(/[^a-zA-Z0-9]+/g)
      .map(el => el.slice(0, 1))
      .slice(0, 3)
      .join('').toUpperCase();

    this.defaultHue = this.getHash(value);
  }

  constructor() { }

  ngOnInit(): void {
  }

  private getHash(text: string): number {
    let hash = 0;
    text.split('').forEach(chr => {
      // eslint-disable-next-line no-bitwise
      hash ^= chr.charCodeAt(0);
    });
    return hash;
  }

}
