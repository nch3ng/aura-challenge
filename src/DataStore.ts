import * as fs from "fs";
import { Zip } from "./types";
import * as util from "./utils";

export default class DataStore {
  dataPath: string;
  gridPath: string;
  _zips: Zip[];
  _indexGrids: any;

  mapTable = {
    city: ["primary_city", "acceptable_cities"],
    zipcode: ["zip"]
  };
  constructor(dataPath: string, gridPath: string) {
    this.dataPath = dataPath;
    this.gridPath = gridPath;
  }

  connect(): void {
    // dataPath is file
    try {
      this._zips = JSON.parse(fs.readFileSync(this.dataPath).toString());
      this._indexGrids = JSON.parse(fs.readFileSync(this.gridPath).toString());
    } catch (e) {
      throw e;
    }
    // dataPath is database
  }

  zips(): Zip[] {
    return this._zips;
  }

  indexGrids(): { [id: string]: Zip } {
    return this._indexGrids;
  }

  search(param): Zip[] {
    return this._zips.filter((zip: Zip) => {
      for (const field of this.mapTable[param.name]) {
        // console.log(zip[field]);
        if (!!zip[field] && zip[field].includes(param.value)) {
          return true;
        }
      }
    });
  }

  findClosestZip(value) {
    return util.findClosestZip(this._indexGrids, value);
  }

  filter(zips: Zip[], filter: string) {
    return util.filter(zips, filter);
  }
}
