
export interface UserNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  links?: { label: string; url: string; external: boolean; fragment: string; }[];
  data?: {
    [key: string]: any;
  };
  ts: Date;
  isRead: boolean;
}

export interface AdminNotification {
  title: string;
  body: string;
  links?: { label: string; url: string }[];
}

export interface NotificationSettings {
  enabled: boolean;
  email?: string;
}
