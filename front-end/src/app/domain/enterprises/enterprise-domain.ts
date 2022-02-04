import { ContactItem, Location } from '@domain/common-domain';
import { Attachment } from '@domain/attachments/attachment.domain';

export interface KeyProject {
  /** @deprecated */
  country: string;

  title: string;
  description: string;
  location: Location;
  latlng?: [number, number];
  showOnMap: boolean;
  webPage: string;
  company?: Enterprise;
}

export interface Enterprise {
  id: string;
  companyName: string;
  companyProfile: string;
  categoryIds: string[];
  standards: string[];
  otherStandards: string[];
  location: Location;
  latlng: [number, number];
  displayOnGlobalMap: boolean;
  webPage: string;
  socialMedia: string;
  referenceProjects: string;
  imageUrl: string;
  readyForPublishing: boolean;
  status: string;
  contacts: ContactItem[];
  keyProjects: KeyProject[];
  attachments: Attachment[];
  changedTs: Date;
  reports: any[];
  isPublic: boolean;
  pendingReview: boolean;
  rejectReason: string;
}

export interface Invitation {
  id: string;
  name: string;
  createdTs: Date;
  companyName?: string;
  enterpriseId: string;
}

export interface EnterpriseShare extends Pick<Enterprise, 'id' | 'companyName'> {
  owners: { id: string; name: string; self: boolean }[];
  invites: Invitation[];
}

export const standards: { code: string; label: string }[] = [
  {
    code: 'ISO 20675:2018',
    label: 'Biogas &mdash; Biogas production, conditioning, upgrading, and utilization &mdash; ' +
      'Terms, definitions, and classification scheme'
  },
  {
    code: 'ISO/AWI 23590',
    label: 'Household Biogas System Requirements'
  },
  {
    code: 'ISO 24252',
    label: 'Biogas systems &mdash; Non-household and non-gasification <em>(close to be published)</em>'
  }
];

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
