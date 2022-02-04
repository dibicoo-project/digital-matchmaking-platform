import { injectable } from 'inversify';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { EnterpriseStatistics } from './analytics.domain';
import { AnalyticsRepository } from './analytics.repository';

@injectable()
export class AnalyticsService {

  constructor(private repository: AnalyticsRepository,
    private client: BetaAnalyticsDataClient) { }

  async collectEnterprises() {
    const propertyId = '262576036';

    const query: any = {
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '28daysAgo',
          endDate: 'today',
          name: 'monthly'
        },
        {
          startDate: '7daysAgo',
          endDate: 'today',
          name: 'weekly'
        },
      ],
      dimensions: [
        { name: 'customEvent:company_id' },
        { name: 'country' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'eventCount' }
      ],
      orderBys: [
        { dimension: { dimensionName: 'customEvent:company_id' } },
        { dimension: { dimensionName: 'country' } }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: 'company_profile_view' }
        }
      }
    };

    const [response] = await this.client.runReport(query);
    const report: { [id: string]: EnterpriseStatistics } = {};

    response.rows?.forEach(row => {
      const [id, country, range] = row.dimensionValues!.map(v => v.value as string);
      const [users, views] = row.metricValues!.map(v => v.value)

      if (!report[id]) {
        report[id] = { items: [], updatedTs: new Date() };
      }

      let item = report[id].items.find(i => i.country === country);

      if (!item) {
        item = { country, monthlyUsers: 0, monthlyViews: 0, weeklyUsers: 0, weeklyViews: 0 };
        report[id].items.push(item);
      }

      if (range === 'monthly') {
        item.monthlyUsers = parseInt(users as any, 10) || 0;
        item.monthlyViews = parseInt(views as any, 10) || 0;
      } else if (range === 'weekly') {
        item.weeklyUsers = parseInt(users as any, 10) || 0;
        item.weeklyViews = parseInt(views as any, 10) || 0;
      }
    });

    const promises = Object.entries(report).map(([id, value]) => this.repository.upsert(id, value));
    await Promise.all(promises);
    return 'Ok';
  }

  public async getEnterpriseStatistics(id: string) {
    const data = await this.repository.findOne(id);
    return data;
  }


}
