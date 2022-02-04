
type FilterGroup = 'company-region' | 'business-field' | 'project-region' | 'profile-updates';
type FilterType = 'region' | 'subregion' | 'country' | 'categoryId' | 'updatedAgo';

export interface FilterDefinition {
  type: FilterType;
  value: string | number;
  label?: string;
}

export type Filters = { [key in FilterGroup]?: FilterDefinition[] };

export interface FiltersBean {
  id?: string;
  label: string;
  filters: Filters;
}

export interface FiltersEntity extends Omit<FiltersBean, 'id'> {
  owner: string;
  changedTs: Date;
  objectIds: string[];
}