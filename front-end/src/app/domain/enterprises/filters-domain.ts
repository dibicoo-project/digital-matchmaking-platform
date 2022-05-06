import { ParamMap } from '@angular/router';

export type FilterGroup = 'company-region' | 'business-field' | 'project-region' | 'profile-updates';

export type FilterType = 'region' | 'subregion' | 'country' | 'categoryId' | 'updatedAgo';

export interface FilterDefinition {
  type: FilterType;
  value: string | number;
  label?: string;
};

export type Filters = { [key in FilterGroup]?: FilterDefinition[] };

export interface FiltersBean {
  id?: string;
  label: string;
  filters: Filters;
}

export const emptyFilters = (): Filters => ({
  'business-field': [],
  'company-region': [],
  'profile-updates': [],
  'project-region': [],
});

export const updatedAgoLabel = (days: number): string => {
  switch (days) {
    case 2:
      return 'Updated recently';
    case 7:
      return 'Updated last week';
    case 30:
      return 'Updated last month';
    default:
      return `Updated ${days} days ago`;
  }
};

export const filtersToParams = (filters: Filters): any => {
  const params = {
    b: filters['business-field']?.filter(item => item.type === 'categoryId').map(item => item.value),
    cr: filters['company-region']?.filter(item => item.type === 'region').map(item => item.value),
    cs: filters['company-region']?.filter(item => item.type === 'subregion').map(item => item.value),
    cc: filters['company-region']?.filter(item => item.type === 'country').map(item => item.value),
    pr: filters['project-region']?.filter(item => item.type === 'region').map(item => item.value),
    ps: filters['project-region']?.filter(item => item.type === 'subregion').map(item => item.value),
    pc: filters['project-region']?.filter(item => item.type === 'country').map(item => item.value),
    u: filters['profile-updates']?.filter(item => item.type === 'updatedAgo').map(item => item.value),
  };

  return Object.fromEntries(
    Object.entries(params)
      .filter(([k, v]) => !!v && v.length)
  );
};

export const paramsToFilters = (params: ParamMap): Filters => {
  const filters = emptyFilters();
  filters['business-field'].push(
    ...params.getAll('b').map(value => ({ type: 'categoryId', value }) as FilterDefinition)
  );
  filters['company-region'].push(
    ...params.getAll('cr').map(value => ({ type: 'region', value }) as FilterDefinition),
    ...params.getAll('cs').map(value => ({ type: 'subregion', value }) as FilterDefinition),
    ...params.getAll('cc').map(value => ({ type: 'country', value }) as FilterDefinition),
  );
  filters['project-region'].push(
    ...params.getAll('pr').map(value => ({ type: 'region', value }) as FilterDefinition),
    ...params.getAll('ps').map(value => ({ type: 'subregion', value }) as FilterDefinition),
    ...params.getAll('pc').map(value => ({ type: 'country', value }) as FilterDefinition),
  );
  filters['profile-updates'].push(
    ...params.getAll('u').map(value => ({
      type: 'updatedAgo', value, label: updatedAgoLabel(parseInt(value))
    }) as FilterDefinition),
  );
  return filters;
};
