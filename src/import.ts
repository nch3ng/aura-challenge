/*
 * This is the tools used to import to DB, but eventually are not used. The generateGrid function is to generate a set of grids in the maps.  Each grid includes a set of zipcodes
 */

import * as fs from 'fs';
import * as aws from 'aws-sdk';
import * as util from './utils';
import { Grid, Zip } from './types';
const dynamoClient = new aws.DynamoDB.DocumentClient();

module.exports.importGrid = async event => {

  const grids = JSON.parse(fs.readFileSync('./src/grid.min.json').toString());
  let result: any;
  let i = 1;
  for (let grid of grids) {
    let gridParams = {
      TableName: 'grids-dev',
      Item: {
        "id": i.toString(),
        "top": grid.top,
        "left": grid.left,
        "bottom": grid.bottom,
        "right": grid.right    
      }
    }
    try {
      result = await dynamoClient.put(gridParams).promise();
      i++;
      console.log(result)
    } catch (err) {
      console.error("Unable to add grid", grid.id, ". Error JSON:", JSON.stringify(err));        
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Done'
    })
  };
}

module.exports.importZip = async event => {
  let zips: Zip [];
  let grids: Grid [];
  let i = 1;
  try {
    zips = JSON.parse(fs.readFileSync('./src/data.json').toString());
    grids = JSON.parse(fs.readFileSync('./src/grid.min.json').toString());
    console.log(`Total: ${zips.length}`);
    for (let zip of zips) {
      let belong = false;
      for (let grid of grids) {
        const zLat = parseFloat(zip.latitude);
        const zlong = parseFloat(zip.longitude);
        if (zLat >= grid.bottom && zLat <= grid.top && zlong >= grid.left && zlong <= grid.right) {
          let zipParams = {
            TableName: 'zips-dev',
            Item: {
              zip: zip.zip,
              type: zip.type,
              primary_city: zip.primary_city,
              acceptable_cities: zip.acceptable_cities,
              unacceptable_cities: zip.unacceptable_cities,
              state: zip.state,
              county: zip.county,
              timezone: zip.timezone,
              area_codes: zip.area_codes,
              latitude: zip.latitude,
              longitude: zip.longitude,
              country: zip.country,
              estimated_population: zip.estimated_population,
              grid_id: grid.id
            }
          }
          let result = await dynamoClient.put(zipParams).promise();
          belong = true;
          console.log(`putItem succeed ${i}: ${zip.zip}`);
          // console.log(result);
          i++;
          break;
        }
      } 
      if (!belong){
        console.log(`Not belong to any: ${zip.zip}`);
      }
    }
  } catch (error) {
    console.error("Unable to add zip, Error JSON:", JSON.stringify(error));   
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Done'
    })
  };
}

module.exports.generateGrid = async event => {
  // do stuff...
  
  let zips: Zip [];

  try {
    zips = JSON.parse(fs.readFileSync('./src/data.json').toString());
    
    const grids: Grid [] = util.buildGrids(zips);
    util.assignZips(grids, zips);
    fs.writeFile('./src/grids.json', JSON.stringify(grids), function (err) {
      if (err) return console.log(err);
      console.log('Successfully saved to grid.json');
    });

    let gridsIndex: any = {};

    for (let grid of grids) {
      gridsIndex[grid.id] = grid;
    }

    fs.writeFile('./src/grids.index.json', JSON.stringify(gridsIndex), function (err) {
      if (err) return console.log(err);
      console.log('Successfully saved to grid.index.json');
    });

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
      message: 'Done'
    })
  };
};