import * as fs from 'fs';
import handler from '../src/index';

const data = JSON.parse(fs.readFileSync('./src/data.json').toString());

describe('zipcode API handler', () => {
  let testZips;
  beforeEach(async () => {
    testZips = data;
  })
  it('should look up with city name', () => {
    const event = {
      "httpMethod": "GET",
      "path": "/zipcode/search",
      "headers": {},
      "queryStringParameters": {
        "city": "Douglas"
      }
    }

    console.log(handler(event));
  });
});

