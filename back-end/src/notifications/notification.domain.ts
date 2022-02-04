import moment from 'moment';

export enum NotificationIcon {
  positive = 'check_circle',
  negative = 'warning',
  info = 'info',
  statistics = 'poll',
  matchmaking = 'group_add'
}

export enum NotificationSource {
  companyProfile = 'company',
  application = 'application',
  statistics = 'statistics',
  matchmaking = 'matchmaking',
  system = 'system'
}

export interface Notification {
  title: string;
  body: string;
  icon: NotificationIcon;
  source: NotificationSource;
  links?: Array<{
    label: string;
    url: string;
    external?: boolean;
    fragment?: string;
  }>;
  data?: {
    [key: string]: any;
  };
  ts: Date;

  isRead: boolean;
  emailSent: boolean;
}

interface PublicNotification extends Omit<Notification, 'emailSent'> {
  id: string;
}

export type NotificationBean = Partial<PublicNotification>;

export interface NotificationSettings {
  enabled: boolean;
  email?: string;
  lastEmailTs: Date;
}
