import { TestBed } from '@angular/core/testing';

import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  const key = 'val' as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService],
    });
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set value to cache', () => {
    service.set(key, 123, 10);
    expect(service['cache'] as any).toEqual({ 'val': jasmine.objectContaining({ value: 123 }) });
  });

  it('should get value from cache', () => {
    service.set(key, 123, 10);
    expect(service.get(key)).toEqual(123);
  });

  it('should get expired value from cache', () => {
    service.set(key, 123, -10);
    expect(service.get(key)).toBeNull(123);
  });

  it('should check if value exists', () => {
    service.set(key, 123, 10);
    expect(service.has(key)).toBeTruthy();
  });

  it('should delete value from cache', () => {
    service.set(key, 123, 10);
    service.delete(key);

    expect(service.get(key)).toBeNull();
  });

  it('should clear cache', () => {
    service.set(key, 123, 10);
    service.clear();
    expect(service['cache'] as any).toEqual({});
  });

});
