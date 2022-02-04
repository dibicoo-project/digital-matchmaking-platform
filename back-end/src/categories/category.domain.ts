export interface Category {
  title: string;
  description: string;
  parentId: string;
  ancestors: string[];
  imageHash: string;
  order: number;
  changedTs: Date;
  changedBy: string;
}

interface PublicCategory extends Omit<Category, 'changedTs' | 'changedBy' | 'imageHash'> {
  id: string;
  imageUrl: string;
}

export type CategoryBean = Partial<PublicCategory>;
