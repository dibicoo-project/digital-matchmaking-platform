import { TestBed } from '@angular/core/testing';

import { LocalStateService } from './local-state.service';

describe('LocalStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should put object into local state', () => {
    const service = TestBed.get(LocalStateService);
    spyOn(localStorage, 'setItem');
    service.put('testKey', { a: 1, b: '2', c: true });
    expect(localStorage.setItem).toHaveBeenCalledWith('testKey', '{"a":1,"b":"2","c":true}');
  });

  it('should get object from local state', () => {
    const service = TestBed.get(LocalStateService);
    spyOn(localStorage, 'getItem').and.returnValue('{"a":1,"b":"2","c":true}');
    const res = service.get('testKey');
    expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(res).toEqual({ a: 1, b: '2', c: true });
  });

  it('should get default value if nothing stored', () => {
    const service = TestBed.get(LocalStateService);
    spyOn(localStorage, 'getItem');
    expect(service.get('testKey')).toBeUndefined();
    expect(service.get('testKey', 'default')).toEqual('default');
  });

  it('should get default value if parse failed', () => {
    const service = TestBed.get(LocalStateService);
    spyOn(localStorage, 'getItem').and.returnValue('invalid { JSON } value');
    expect(service.get('testKey')).toBeUndefined();
    expect(service.get('testKey', 'default')).toEqual('default');
  });
});
