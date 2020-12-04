// lambda-like handler function
import * as fs from 'fs';
import * as aws from 'aws-sdk';
const dynamoClient = new aws.DynamoDB.DocumentClient();
  // {
  // region: 'localhost',
  // endpoint: 'http://localhost:8000'
// });

type Zip = {
  zip: string,
  type: string,
  primary_city: string,
  acceptable_cities: string | null,
  unacceptable_cities: string | null,
  state: string,
  county: string,
  timezone: string,
  area_codes: string,
  latitude: string,
  longitude: string,
  country: string,
  estimated_population: string,
  grid_id: string
}

// divided all data into grids
type Grid = {
  id?: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  zips: Zip [];
  latSize: number;
  longSize: number;
}

// This eventually should run once and be saved in database instead of running handler because ideally we only build the grids and assign the zips once, but not building it every time calling the handler
// The data schema is like Zip and Grid in DB
// The whole map is divided into 100 grids
// Any search with coordinates will search the grid first and then search in zip array if the coords matchs the grid
// All grids are mutually exclusive

const buildGrids = (zips: Zip []): Grid [] => {
  let minLat = 100, maxLat = -100;
  let minLong = 100, maxLong = -100
  const grids: Grid [] = []
  for (let zip of zips) {
    const zLat: number = parseFloat(zip.latitude);
    const zLong: number = parseFloat(zip.longitude);
    if (zLat < minLat) minLat = zLat;
    if (zLong < minLong) minLong = zLong;
    if (zLat > maxLat) maxLat = zLat;
    if (zLong > maxLong) maxLong = zLong;
  }

  const latLength = maxLat - minLat;
  const LongLength = maxLong - minLong;

  const partition = 10.0
  const partitionLat = latLength / partition;
  const partitionLong = LongLength / partition;
  for (let i = 0; i < partition; i++) {
    for (let j = 0; j < partition; j++) {
      let grid: Grid = {
        top: maxLat - (i * partitionLat),
        left: minLong + (j* partitionLong),
        bottom: maxLat - ((i+1) * partitionLat),
        right: minLong + ((j+1)* partitionLong),
        zips: [],
        latSize: partitionLat,
        longSize: partitionLong
      } 

      grids.push(grid)
    }
  }
  return grids;
}

const assignZips = (grids: Grid [], zips: Zip []) => {
  for (let zip of zips) {
    for (let grid of grids) {
      const zLat = parseFloat(zip.latitude);
      const zlong = parseFloat(zip.longitude);
      if (zLat >= grid.bottom && zLat <= grid.top && zlong >= grid.left && zlong <= grid.right) {
        grid.zips.push(zip);
      }
    }
  }
  return grids;
}

// End of building and assign zips
module.exports.handler = async event => {
  // do stuff...
  console.log('Received event:', JSON.stringify(event, null, 2));
  let result;
  try {
    const zips = JSON.parse(fs.readFileSync('./src/data.json').toString());
    
    if (event.queryStringParameters && event.queryStringParameters.city) {
      const cityQuery = event.queryStringParameters.city;
      console.log(cityQuery);
      result = zips.filter((zip: Zip) => {
        if ((zip.primary_city && zip.primary_city.includes(cityQuery)) || zip.acceptable_cities && zip.acceptable_cities.includes(cityQuery)) {
          console.log(zip)
          return true;
        }
      })
    }

    if (event.queryStringParameters && event.queryStringParameters.zipcode) {
      const zipcodeQuery = event.queryStringParameters.zipcode;
      console.log(zipcodeQuery);
      result = zips.filter((zip: Zip) => {
        if ((zip.zip && zip.zip.includes(zipcodeQuery))) {
          console.log(zip)
          return true;
        }
      })
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
      city: result
    })
  };
};

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
  let grids: Grid [];
  try {
    zips = JSON.parse(fs.readFileSync('./src/data.json').toString());
    
    const grids: Grid [] = buildGrids(zips);
    assignZips(grids, zips);
    fs.writeFile('./src/grid.json', JSON.stringify(grids), function (err) {
      if (err) return console.log(err);
      console.log('Successfully saved to grid.json');
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
