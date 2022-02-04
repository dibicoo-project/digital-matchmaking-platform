import { Attachment, BaseEntity, ContactItem, LatLng, Location } from '../common/common.domain';

export interface KeyProject {
  location: Location;
  latlng?: LatLng;
  title: string;
  description: string;
  showOnMap?: boolean;
  webPage?: string;
}

interface EnterpriseBase extends BaseEntity {
  companyName: string;
  companyProfile: string;
  webPage?: string;
  contacts: ContactItem[];
  location: Location;
  displayOnGlobalMap: boolean;
  latlng?: LatLng;
  categoryIds: string[];
  standards: string[];
  otherStandards: string;
  referenceProjects?: string;
  keyProjects?: KeyProject[];
  attachments: Attachment[];
  logoId?: string;
  rejectReason?: string;
}

export interface Enterprise extends EnterpriseBase {
  pendingReview?: boolean;
  rejectReason?: string;
}

export interface PublicEnterprise extends EnterpriseBase {
  reports?: Array<{ ts: Date, message: string }>;
}

interface EnterpriseBeanBase extends Omit<Enterprise & PublicEnterprise, 'owners' | 'changedBy'> {
  id: string;
  isPublic: boolean;
  imageUrl: string;
}

export type EnterpriseBean = Partial<EnterpriseBeanBase>;

export interface EnterpriseChangeBean {
  action: 'publish' | 'unpublish'
}

export interface EnterpriseAdminChangeBean {
  action: 'publish' | 'unpublish' | 'reject',
  message?: string
}



export interface Invitation {
  enterpriseId: string;
  name: string;
  createdTs: Date;
  createdBy: string;
}

export interface InvitationBean extends Omit<Invitation, 'enterpriseId' | 'createdBy'> {
  id: string;
}

export interface OwnerBean {
  id: string;
  name: string;
  self?: boolean;
}

export interface EnterpriseShareBean extends Pick<Enterprise, 'companyName'> {
  id: string;
  owners: OwnerBean[];
  invites: InvitationBean[];
}

export interface EnterpriseWatchList {
  ids: string[];
}