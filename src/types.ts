export type Zip = {
  zip: string;
  type: string;
  primary_city: string;
  acceptable_cities: string | null;
  unacceptable_cities: string | null;
  state: string;
  county: string;
  timezone: string;
  area_codes: string;
  latitude: string;
  longitude: string;
  country: string;
  estimated_population: string;
  grid_id: string;
};

// divided all data into grids
export type Grid = {
  id: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  axisX: number;
  axisY: number;
  zips: Zip[];
  latSize: number;
  longSize: number;
};

export type Point = {
  lat: number;
  long: number;
};
