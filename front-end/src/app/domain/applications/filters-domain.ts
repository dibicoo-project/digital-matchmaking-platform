import { ParamMap } from '@angular/router';

export type FilterGroup = 'business-field' | 'project-region';

export type FilterType = 'region' | 'subregion' | 'country' | 'categoryId';

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
  'project-region': [],
});

export const filtersToParams = (filters: Filters): any => {
  const params = {
    b: filters['business-field']?.filter(item => item.type === 'categoryId').map(item => item.value),
    pr: filters['project-region']?.filter(item => item.type === 'region').map(item => item.value),
    ps: filters['project-region']?.filter(item => item.type === 'subregion').map(item => item.value),
    pc: filters['project-region']?.filter(item => item.type === 'country').map(item => item.value),
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
  filters['project-region'].push(
    ...params.getAll('pr').map(value => ({ type: 'region', value }) as FilterDefinition),
    ...params.getAll('ps').map(value => ({ type: 'subregion', value }) as FilterDefinition),
    ...params.getAll('pc').map(value => ({ type: 'country', value }) as FilterDefinition),
  );
  return filters;
};
