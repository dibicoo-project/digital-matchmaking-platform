import { createMock } from './../../test/utils';
import { SearchService } from './search.service';
import { ApplicationIndex } from './application.index';
import { EnterpriseIndex } from './enterprise.index';
import lunr from 'lunr';

describe('SearchService', () => {

  let companyIndex: EnterpriseIndex;
  let applicationIndex: ApplicationIndex;

  let service: SearchService;

  const mockResults = [
    {
      ref: '123',
      matchData: {
        metadata: {
          term1: {
            field1: {},
            field2: {}
          }
        }
      }
    },
    {
      ref: '987',
      matchData: {
        metadata: {
          term1: {
            field1: {}
          },
          term2: {
            field2: {}
          }
        }
      }
    }
  ] as lunr.Index.Result[];

  beforeEach(() => {
    companyIndex = createMock(EnterpriseIndex);
    applicationIndex = createMock(ApplicationIndex);
    service = new SearchService(companyIndex, applicationIndex);
  });

  it('should reject empty query', async () => {
    await expectAsync(service.search('all', '   ')).toBeRejected();
  });

  it('should search everywhere', async () => {
    const compSpy = jasmine.createSpy('search spy').and.returnValue(mockResults);
    const appSpy = jasmine.createSpy('search spy').and.returnValue(mockResults);
    spyOn(companyIndex, 'get').and.returnValue(Promise.resolve({ search: compSpy } as any));
    spyOn(applicationIndex, 'get').and.returnValue(Promise.resolve({ search: appSpy } as any));

    const res = await service.search('all', 'abc xyz');

    expect(companyIndex.get).toHaveBeenCalled();
    expect(applicationIndex.get).toHaveBeenCalled();
    expect(compSpy).toHaveBeenCalledWith('abc* xyz*');
    expect(appSpy).toHaveBeenCalledWith('abc* xyz*');
    expect(res.companies![0]).toEqual({ ref: '123', terms: { term1: ['field1', 'field2'] } });
    expect(res.companies![1]).toEqual({ ref: '987', terms: { term1: ['field1'], term2: ['field2'] } });
  });

  it('should search using advanced symbols', async () => {
    const compSpy = jasmine.createSpy('search spy').and.returnValue(mockResults);
    const appSpy = jasmine.createSpy('search spy').and.returnValue(mockResults);
    spyOn(companyIndex, 'get').and.returnValue(Promise.resolve({ search: compSpy } as any));
    spyOn(applicationIndex, 'get').and.returnValue(Promise.resolve({ search: appSpy } as any));

    const res = await service.search('all', 'abc^10 +xyz~2');

    expect(companyIndex.get).toHaveBeenCalled();
    expect(applicationIndex.get).toHaveBeenCalled();
    expect(compSpy).toHaveBeenCalledWith('abc^10 +xyz~2');
    expect(appSpy).toHaveBeenCalledWith('abc^10 +xyz~2');
  });

  it('should search in companies', async () => {
    const compSpy = jasmine.createSpy('search spy').and.returnValue(mockResults);
    spyOn(companyIndex, 'get').and.returnValue(Promise.resolve({ search: compSpy } as any));
    spyOn(applicationIndex, 'get');

    const res = await service.search('enterprises', 'abc xyz');

    expect(companyIndex.get).toHaveBeenCalled();
    expect(applicationIndex.get).not.toHaveBeenCalled();
    expect(compSpy).toHaveBeenCalledWith('abc* xyz*');
  });

  it('should search in applications', async () => {
    const appSpy = jasmine.createSpy('search spy').and.returnValue(mockResults);
    spyOn(companyIndex, 'get')
    spyOn(applicationIndex, 'get').and.returnValue(Promise.resolve({ search: appSpy } as any));

    const res = await service.search('applications', 'abc xyz');

    expect(companyIndex.get).not.toHaveBeenCalled();
    expect(applicationIndex.get).toHaveBeenCalled();
    expect(appSpy).toHaveBeenCalledWith('abc* xyz*');
  });

});
