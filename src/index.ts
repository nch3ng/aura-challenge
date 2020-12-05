import * as util from "./utils";
import DataStore from "./DataStore";
import { generateGrid } from "./import";

// End of building and assign zips
const handler = async event => {
  // do stuff...
  console.log('Received event:', JSON.stringify(event, null, 2));
  let result;

  try {
    const ds: DataStore = new DataStore(
      process.env.ZIPS_DATA_PATH,
      process.env.GRID_INDEX_DATA_PATH
    );
    ds.connect();

    const param: any = util.readParams(event);

    if (!param) throw "400 Invalid Input";

    if (param.name !== "coordinate") {
      // Filter with partial or full city name or zipcode
      result = ds.search(param);
    } else {
      // Check coordinates
      result = ds.findClosestZip(param.value);
    }

    if (event.queryStringParameters && event.queryStringParameters.filter) {
      result = ds.filter(result, event.queryStringParameters.filter);
    } 
    // else if (event.body) {
    //   const filter = JSON.parse(event.body).filter;
    //   if (JSON.parse(event.body).filter) {
    //     result = ds.filter(result, filter);
    //   }
    // }
    // console.log(filter)
    // result = ds.filter(result, filter);
  } catch (error) {
    return {
      statusCode: 400,
      error
    };
  }

  return {
    statusCode: 200,
    zips: result
  };
};

export { handler, generateGrid };
