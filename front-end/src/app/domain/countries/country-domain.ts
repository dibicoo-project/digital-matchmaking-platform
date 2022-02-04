export interface Country {
  name: string;
  region: string;
  subregion: string;
  flag: string;
  latlng: [number, number];
  altSpellings: string[];
  cca2: string;
  cca3: string;
}

export interface CountryGroup {
  name: string;
  items: CountryGroup[] | Country[];
}
