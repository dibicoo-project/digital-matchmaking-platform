import { TimeAgoPipe } from './time-ago.pipe';
import { ChangeDetectorRef } from '@angular/core';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;

  beforeEach(() => {
    jasmine.clock().mockDate(new Date('2019-01-22T10:20:30Z'));
    pipe = new TimeAgoPipe({ markForCheck: () => null } as ChangeDetectorRef);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform value', () => {
    expect(pipe.transform('invalid-date')).toBeNull();
    expect(pipe.transform('2019-01-22T10:20:20Z')).toMatch('few seconds');
    expect(pipe.transform('2019-01-22T10:19:31Z')).toMatch('59 seconds');
    expect(pipe.transform('2019-01-22T10:18:31Z')).toMatch('minute');
    expect(pipe.transform('2019-01-22T09:20:31Z')).toMatch('59 minutes');
    expect(pipe.transform('2019-01-22T09:20:29Z')).toMatch('hour');
    expect(pipe.transform('2019-01-21T10:20:31Z')).toMatch('23 hours');
    expect(pipe.transform('2019-01-21T10:20:29Z')).toMatch('2019-01-21');
  });
});
