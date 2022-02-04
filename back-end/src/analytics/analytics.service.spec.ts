import { createMock } from './../../test/utils';

import { DiBiCooPrincipal } from '../security/principal';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

describe('AnalyticsService', () => {

  let service: AnalyticsService;
  let repository: AnalyticsRepository;
  let client: BetaAnalyticsDataClient;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john',
      isResourceOwner: () => Promise.resolve(true),
      isInRole: () => Promise.resolve(false)
    } as any;

    repository = createMock(AnalyticsRepository);
    client = createMock(BetaAnalyticsDataClient);
    service = new AnalyticsService(repository, client);
  });

  it('should collect enterprise statistics', async () => {
    const googleResponse = {
      rows: [
        {
          dimensionValues: [{ value: "111" }, { value: "Latvia" }, { value: "monthly" }],
          metricValues: [{ value: "10" }, { value: "20" }]
        },
        {
          dimensionValues: [{ value: "111" }, { value: "Latvia" }, { value: "weekly" }],
          metricValues: [{ value: "30" }, { value: "40" }]
        },
        {
          dimensionValues: [{ value: "222" }, { value: "Germany" }, { value: "monthly" }],
          metricValues: [{ value: "50" }, { value: "60" }]
        }
      ]
    };

    spyOn(repository, 'upsert').and.returnValue(Promise.resolve());
    spyOn(client, 'runReport').and.returnValue(Promise.resolve([googleResponse]) as any);

    const res = await service.collectEnterprises();

    expect(res).toBe('Ok');
    expect(repository.upsert).toHaveBeenCalledTimes(2);
    expect(repository.upsert).toHaveBeenCalledWith('111',
      {
        items: [{ country: 'Latvia', weeklyUsers: 30, weeklyViews: 40, monthlyUsers: 10, monthlyViews: 20 }],
        updatedTs: jasmine.anything()
      } as any);

      expect(repository.upsert).toHaveBeenCalledWith('222',
      {
        items: [{ country: 'Germany', weeklyUsers: 0, weeklyViews: 0, monthlyUsers: 50, monthlyViews: 60 }],
        updatedTs: jasmine.anything()
      } as any)
  });

  it('should get enterprise statistics', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({} as any));
    await service.getEnterpriseStatistics('123');
    expect(repository.findOne).toHaveBeenCalledWith('123');
  });
});
