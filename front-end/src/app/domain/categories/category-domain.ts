export interface Category {
  description?: string;
  imageUrl?: string;
  title?: string;
  parentId?: string;
  ancestors?: string[];
  order?: number;
  ancestorCategories?: this[]; // self reference to Category
  childrenCategories?: this[];
  id?: string;
  /**@deprecated */
  isSelected?: boolean;
  isAD?: boolean;
  isGAS?: boolean;
  numCompanies?: number;
  numChildren?: number;
}
