import * as util from "./utils";
import DataStore from "./DataStore";
import { generateGrid } from "./import";
import * as yup from 'yup';
// import * as joi from 'joi';


const handler = async (event: any): Promise<any> => {
  // console.log("Received event:", JSON.stringify(event, null, 2));
  let result: any;
  // const querySchema = yup.object({
  //   city: yup.string(),
  //   zipcode: yup.string(),
  //   coordinate: yup.string()
  // });
  // const validated: any = querySchema.validateSync(event.queryStringParameters);
  // const valid = await querySchema.isValid(event.queryStringParameters);
  // console.log(valid);
  try {
    
    const param: any = util.readParams(event);
    if (!param) throw "400 Invalid Input";

    const ds: DataStore = new DataStore(
      process.env.ZIPS_DATA_PATH || "",
      process.env.GRID_INDEX_DATA_PATH || ""
    );
    ds.connect();

    

    result = param.name !== "coordinate" ? ds.search(param) : ds.findClosestZip(param.value);

    if (param.filter) {
      result = ds.filter(result, param.filter);
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

  // Lambda should return body in JSON string format
  return {
    statusCode: 200,
    zips: result
  };
};

export { handler, generateGrid };
