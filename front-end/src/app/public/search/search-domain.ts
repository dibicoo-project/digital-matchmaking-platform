export interface SearchResultItem {
  ref: string;
  terms: { [term: string]: string[] };
  flatTerms: string;
}

export interface SearchResults {
  companies?: SearchResultItem[];
  totalCompanies?: number;
  applications?: SearchResultItem[];
  totalApplications?: number;
}
