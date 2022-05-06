import { Location } from '@angular/common';
import { BackButtonDirective } from './back-button.directive';

describe('BackButtonDirective', () => {
  it('should create an instance', () => {
    const directive = new BackButtonDirective({} as Location);
    expect(directive).toBeTruthy();
  });
});
