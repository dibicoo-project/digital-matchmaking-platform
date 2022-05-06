import lunr from "lunr";

export interface SearchResultItem {
  ref: string;
  terms: { [term: string]: string[] };
}

export interface SearchResults {
  companies?: SearchResultItem[];
  totalCompanies?: number;
  applications?: SearchResultItem[];
  totalApplications?: number;
}

export function convertItem(res: lunr.Index.Result): SearchResultItem {
  return {
    ref: res.ref,
    terms: Object.fromEntries(
      Object.entries(res.matchData?.metadata || {})
        .map(([term, fields]) => [term, Object.keys(fields)])
    )
  };
}