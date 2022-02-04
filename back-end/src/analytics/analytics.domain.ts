
interface CountryStatistics {
  country: string;
  monthlyUsers: number;
  monthlyViews: number;
  weeklyUsers: number;
  weeklyViews: number;
}

export interface EnterpriseStatistics {
  items: CountryStatistics[];
  updatedTs: Date;
}