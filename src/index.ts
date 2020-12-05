// lambda-like handler function
import * as fs from 'fs';
import { Zip } from './types';
import * as util from './utils';


// End of building and assign zips
module.exports.handler = async event => {
  // do stuff...
  console.log('Received event:', JSON.stringify(event, null, 2));
  let result;
  // the table to find the fields to filter the data
  const mapTable = {
    city: ['primary_city','acceptable_cities'],
    zipcode: ['zip']
  }
  try {

    const param: any = util.readParams(event);
    

    if (!param) throw '400 Invalid Input';

    const zips = JSON.parse(fs.readFileSync('./src/data.json').toString());

    if (param.name !== 'coordinate') {
      // Filter with partial or full city name or zipcode
      result = zips.filter((zip: Zip) => {
        for (let field of mapTable[param.name]) {
          // console.log(zip[field]);
          if (!!zip[field] && zip[field].includes(param.value)) {
            return true;
          }
        }
      }) 
    } else {
      const grids = JSON.parse(fs.readFileSync('./src/grids.index.json').toString());

      // Check coordinates
      result = util.findClosestZip(grids, param.value);
    }

    if (event.queryStringParameters && event.queryStringParameters.filter) {
      result = util.filter(result, event.queryStringParameters.filter);
    }
    
    
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Done',
      zips: result
    })
  };
};


