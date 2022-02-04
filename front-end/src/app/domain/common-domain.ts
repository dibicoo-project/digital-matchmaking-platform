export interface ContactItem {
  name: string;
  department: string;
  elements: Contact[];
}

export interface Contact {
  type: string;
  value: string;
}

export interface Location {
  country: string;
  city?: string;
  address?: string;
  zipCode?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}
