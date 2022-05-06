import { Attachment, BaseEntity, ContactItem, Location } from '../common/common.domain';

interface ApplicationBase extends BaseEntity {
  mainCategoryId: string;
  categoryId: string;
  description: string;
  location: Location;
  details?: { [key: string]: string | number };
  attachments?: Attachment[];
  companyName: string;
  webPage?: string;
  contactLocation: Location;
  contacts: ContactItem[];
  dueDate: Date | string;
}

export interface Application extends ApplicationBase {
  pendingReview?: boolean;
  rejectReason?: string;
}

export interface PublicApplication extends ApplicationBase {
  reports?: Array<{ ts: Date, message: string }>;
}

interface ApplicationBeanBase extends Omit<Application & PublicApplication, 'owners' | 'changedBy'> {
  id: string;
  isPublic: boolean;
}

export type ApplicationBean = Partial<ApplicationBeanBase>;

export interface ApplicationChangeBean {
  action: 'publish' | 'unpublish'
}

export interface ApplicationAdminChangeBean {
  action: 'publish' | 'unpublish' | 'reject',
  message?: string
}
