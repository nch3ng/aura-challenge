import * as fs from "fs";
import { Zip } from "./types";
import * as util from "./utils";

export default class DataStore {
  dataPath: string;
  gridPath: string;
  _zips: Zip[];
  _indexGrids: {};

  mapTable = {
    city: ["primary_city", "acceptable_cities"],
    zipcode: ["zip"]
  };
  constructor(dataPath: any, gridPath: any) {
    this.dataPath = dataPath;
    this.gridPath = gridPath;
  }

  connect() {
    // dataPath is file
    try {
      this._zips = JSON.parse(fs.readFileSync(this.dataPath).toString());
      this._indexGrids = JSON.parse(fs.readFileSync(this.gridPath).toString());
    } catch (e) {
      throw e;
    }
    // dataPath is database
  }

  zips() {
    return this._zips;
  }

  indexGrids() {
    return this._indexGrids;
  }

  search(param) {
    return this._zips.filter((zip: Zip) => {
      for (let field of this.mapTable[param.name]) {
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
