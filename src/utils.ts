import { Grid, Point, Zip } from "./types";
const parser = require("odata-parser");
const partition = 10;
// All grids are mutually exclusive
// Only run once for generating the grids info
export const buildGrids = (zips: Zip[]): Grid[] => {
  let minLat = 100,
    maxLat = -100;
  let minLong = 100,
    maxLong = -100;
  const grids: Grid[] = [];
  for (let zip of zips) {
    const [zLat, zLong] = [+zip.latitude, +zip.longitude];

    if (zLat < minLat) minLat = zLat;
    if (zLong < minLong) minLong = zLong;
    if (zLat > maxLat) maxLat = zLat;
    if (zLong > maxLong) maxLong = zLong;
  }

  const latLength = maxLat - minLat;
  const LongLength = maxLong - minLong;

  const partitionLat = latLength / partition;
  const partitionLong = LongLength / partition;
  for (let i = 0; i < partition; i++) {
    for (let j = 0; j < partition; j++) {
      let grid: Grid = {
        id: i * 10 + 1 + j,
        top: maxLat - i * partitionLat,
        left: minLong + j * partitionLong,
        bottom: maxLat - (i + 1) * partitionLat,
        right: minLong + (j + 1) * partitionLong,
        axisX: i,
        axisY: j,
        zips: [],
        latSize: partitionLat,
        longSize: partitionLong
      };

      grids.push(grid);
    }
  }
  return grids;
};

export const assignZips = (grids: Grid[], zips: Zip[]) => {
  for (let zip of zips) {
    for (let grid of grids) {
      const [zLat, zLong] = [+zip.latitude, +zip.longitude];

      if (
        zLat >= grid.bottom &&
        zLat <= grid.top &&
        zLong >= grid.left &&
        zLong <= grid.right
      ) {
        grid.zips.push(zip);
      }
    }
  }
  return grids;
};

export const readParams = event => {
  const validParams = ["city", "zipcode", "coordinate"]; // Accept params
  let params: any = event.queryStringParameters || JSON.parse(event.body);
  if (params) {
    for (let key in params) {
      if (validParams.includes(key)) {
        return { name: key, value: params[key] };
      }
    }
    return null;
  }
};

export const calDistance = (p1: Point, p2: Point): number => {
  const dX = p1.lat - p2.lat;
  const dY = p1.long - p2.long;
  return Math.sqrt(dX * dX + dY * dY);
};

export const findShorestDistanceZip = (zips: Zip[], point: Point): Zip => {
  let minDistance = 10000;
  let shortestZip: any;
  for (let zip of zips) {
    const distance = calDistance(
      { lat: +zip.latitude, long: +zip.longitude },
      point
    );
    if (distance < minDistance) {
      minDistance = distance;
      shortestZip = zip;
    }
  }
  return shortestZip;
};

const getEdgeGridId = (currentId, layer: number) => {
  let id = currentId;

  const i = Math.floor((id - 1) / partition);
  const j = (id - 1) % partition;

  let surroundGridId: number[] = [];

  for (let ii = i - layer; ii <= i + layer; ii++) {
    for (let jj = j - layer; jj <= j + layer; jj++) {
      if (
        (Math.abs(ii - i) === layer || Math.abs(jj - j) === layer) &&
        ii < partition && jj < partition && ii >= 0 && jj >= 0
      ) {
        // console.log(`${ii} ${jj}`);
        surroundGridId.push(ii * 10 + jj + 1);
      }
    }
  }
  return surroundGridId;
};

export const findClosestZip = (grids: any, coordinate: number[] | string) => {
  if (typeof coordinate === "string") {
    // handle coordinate in body
    coordinate = coordinate.split(",").map(coord => +coord);
  }
  let boundary = {
    top: grids[1].top,
    left: grids[1].left,
    right: grids[partition * partition].right,
    bottom: grids[partition * partition].bottom
  };
  const lat = +coordinate[0],
    long = +coordinate[1];

  if (
    lat > boundary.top ||
    lat < boundary.bottom ||
    long < boundary.left ||
    long > boundary.right
  ) {
    throw "Current verion only support the search within the boundary";
  }
  for (let key in grids) {
    if (
      lat >= grids[key].bottom &&
      lat <= grids[key].top &&
      long >= grids[key].left &&
      long <= grids[key].right
    ) {
      let zips;
      if (grids[key].zips.length === 0) {
        // if no zips exist in this grid, expand the grid (there're are several ways to do, define a bigger grid set or find outer layer gradutually for demo purpose)
        for (let layer = 1; layer <= partition; layer++) {
          console.log(layer);
          let surroundGridIds = getEdgeGridId(grids[key].id, layer);
          let surroundGrids = surroundGridIds.map(id => grids[id]);
          zips = surroundGrids.reduce(
            (acc, current) => acc.concat(current.zips),
            []
          );
          if (zips.length > 0) break;
        }
      } else {
        zips = grids[key].zips;
      }
      return findShorestDistanceZip(zips, { lat, long });
    }
  }
};

export const filter = (zips: Zip[], filterStr) => {
  const filterObject = parser.parse(`$filter=${filterStr}`);
  let result;
  if (!filterObject.error) {
    const operator = filterObject.$filter.type;
    let field, value;
    if (filterObject.$filter.left.type === "property") {
      //   console.log(filter);
      field = filterObject.$filter.left.name;
      value = filterObject.$filter.right.value;
    } else {
      throw 'Hasn\'t support deeper filter at the moment';
    }
    switch (operator) {
      case "gt":
        result = zips.filter(zip => +zip[field] > value);
        break;
      case "lt":
        result = zips.filter(zip => +zip[field] === value);
        break;
      case "eq":
        result = zips.filter(zip => zip[field] == value);
        break;
    }
    return result;
  } else {
    throw "the filter format is incorrect";
  }
};
