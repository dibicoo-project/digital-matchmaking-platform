export interface BaseEntity {
  changedBy: string;
  changedTs: Date;
  owners: string[];
}

export interface Contact {
  /** @maxLength 100 */
  type: string;
  /** @maxLength 100 */
  value: string;
}

export interface ContactItem {
  /** @maxLength 100 */
  name?: string;
  /** @maxLength 100 */
  department?: string;
  /** @minItems 1 */
  elements: Contact[];
}

export interface Location {
  /** @maxLength 100 */
  country: string;
  /** @maxLength 100 */
  city?: string;
  /** @maxLength 300 */
  address?: string;
  /** @maxLength 30 */
  zipCode?: string;
}

export type LatLng = [number, number] | undefined;

export interface Attachment {
  fileName: string;
  id?: string;
  comment: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}
