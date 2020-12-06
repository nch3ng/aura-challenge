import { handler } from "./index";

const buildQueryParams = (param: string, value: any) => {
  const response: any = {
    httpMethod: "GET",
    path: "/zipcode/search",
    headers: {},
    queryStringParameters: {}
  };
  response.queryStringParameters[param] = value;
  return response;
};

// const buildRequestBody = (param: string, value: any, filter?: string) => {
//   let bodyStr;

//   if (filter) {
//     bodyStr = `{\"${param}\":\"${value}\", \"filter\":\"${filter}\"}`;
//   } else {
//     bodyStr = `{\"${param}\":\"${value}\"}`;
//   }
//   return {
//     httpMethod: "POST",
//     path: "/zipcode/search",
//     headers: {
//       "content-type": "application/json"
//     },
//     body: bodyStr
//   };
// };

describe("basic tests", () => {
  const full_city_search_result = [
    {
      zip: "01002",
      type: "STANDARD",
      primary_city: "Test City23",
      acceptable_cities: "Cushman, Pelham",
      unacceptable_cities: "South Amherst",
      state: "MA",
      county: "Hampshire County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.37",
      longitude: "-72.52",
      country: "US",
      estimated_population: "16532"
    }
  ];

  const partial_city_search_result = [
    {
      zip: "01014",
      type: "PO BOX",
      primary_city: "Test City123",
      acceptable_cities: null,
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.17",
      longitude: "-72.57",
      country: "US",
      estimated_population: "0"
    },
    {
      zip: "01020",
      type: "STANDARD",
      primary_city: "Chicopee",
      acceptable_cities: "Test City123",
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.17",
      longitude: "-72.57",
      country: "US",
      estimated_population: "24570"
    }
  ];

  const partial_city_search_result_with_filter = [
    {
      zip: "01020",
      type: "STANDARD",
      primary_city: "Chicopee",
      acceptable_cities: "Test City123",
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.17",
      longitude: "-72.57",
      country: "US",
      estimated_population: "24570"
    }
  ];

  const full_zip_search_result = [
    {
      zip: "01013",
      type: "STANDARD",
      primary_city: "Chicopee",
      acceptable_cities: "Willimansett",
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.17",
      longitude: "-72.57",
      country: "US",
      estimated_population: "16669"
    }
  ];

  const partial_zip_search_result = [
    {
      zip: "01010",
      type: "STANDARD",
      primary_city: "Brimfield",
      acceptable_cities: null,
      unacceptable_cities: "East Brimfield",
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.11",
      longitude: "-72.2",
      country: "US",
      estimated_population: "3312"
    },
    {
      zip: "01011",
      type: "STANDARD",
      primary_city: "Chester",
      acceptable_cities: null,
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.28",
      longitude: "-72.98",
      country: "US",
      estimated_population: "1012"
    },
    {
      zip: "01012",
      type: "STANDARD",
      primary_city: "Chesterfield",
      acceptable_cities: null,
      unacceptable_cities: null,
      state: "MA",
      county: "Hampshire County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.4",
      longitude: "-72.85",
      country: "US",
      estimated_population: "639"
    },
    {
      zip: "01013",
      type: "STANDARD",
      primary_city: "Chicopee",
      acceptable_cities: "Willimansett",
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.17",
      longitude: "-72.57",
      country: "US",
      estimated_population: "16669"
    },
    {
      zip: "01014",
      type: "PO BOX",
      primary_city: "Test City123",
      acceptable_cities: null,
      unacceptable_cities: null,
      state: "MA",
      county: "Hampden County",
      timezone: "America/New_York",
      area_codes: "413",
      latitude: "42.17",
      longitude: "-72.57",
      country: "US",
      estimated_population: "0"
    }
  ];

  const closest_zip_result = {
    zip: "01026",
    type: "STANDARD",
    primary_city: "Cummington",
    acceptable_cities: null,
    unacceptable_cities: "West Cummington",
    state: "MA",
    county: "Hampshire County",
    timezone: "America/New_York",
    area_codes: "413",
    latitude: "42.46",
    longitude: "-72.9",
    country: "US",
    estimated_population: "865"
  };

  beforeAll(() => {
    // inject test data
    process.env.ZIPS_DATA_PATH = "./data/test_data.json";
    process.env.GRID_INDEX_DATA_PATH = "./data/test_grids.index.json";
  });

  test("handler function exists", () => {
    expect(typeof handler).toBe("function");
  });

  describe("with query parameters", () => {
    it("should look up zipcodes with full city name", async () => {
      const event = buildQueryParams("city", "Test City23");
      await expect(handler(event)).resolves.toHaveProperty(
        "zips",
        full_city_search_result
      );
    });

    it("should look up zipcodes with partial city name", async () => {
      const event = buildQueryParams("city", "Test City1");

      await expect(handler(event)).resolves.toHaveProperty(
        "zips",
        partial_city_search_result
      );
    });

    it("should look up zipcodes with full zipcode", async () => {
      const event = buildQueryParams("zipcode", "01013");

      await expect(handler(event)).resolves.toHaveProperty(
        "zips",
        full_zip_search_result
      );
    });
    it("should look up zipcodes with partial zipcode", async () => {
      const event = buildQueryParams("zipcode", "0101");

      await expect(handler(event)).resolves.toHaveProperty(
        "zips",
        partial_zip_search_result
      );
    });

    it("should look up the closest zipcode with the coordinate", async () => {
      const event = buildQueryParams("coordinate", [42.45, -72.9]);

      await expect(handler(event)).resolves.toHaveProperty(
        "zips",
        closest_zip_result
      );
    });

    it("should filter zipcodes with population", async () => {
      const event = buildQueryParams("city", "Test City1");
      event.queryStringParameters.filter = "estimated_population gt 16000";

      await expect(handler(event)).resolves.toHaveProperty(
        "zips",
        partial_city_search_result_with_filter
      );
    });
    it("should return error if coordinate out of boundary", async () => {
      const event = buildQueryParams("coordinate", [30, -71.9]);

      await expect(handler(event)).resolves.toHaveProperty(
        "error",
        "Current verion only support the search within the boundary"
      );
    });

    it("should return error if the parameter is incorrect", async () => {
      const event = buildQueryParams("city12", "Test City1");

      await expect(handler(event)).resolves.toHaveProperty(
        "error",
        "400 Invalid Input"
      );
    });

    it("should return error if with bad filter", async () => {
      const event = buildQueryParams("city", "Test City1");
      event.queryStringParameters.filter = "estimated_population in 16000";

      await expect(handler(event)).resolves.toHaveProperty(
        "error",
        "the filter format is incorrect"
      );
    });

    it("should return error if using deeper filter", async () => {
      const event = buildQueryParams("city", "Test City1");
      event.queryStringParameters.filter =
        "estimated_population gt 16000 and estimated_population lt 26000";

      await expect(handler(event)).resolves.toHaveProperty(
        "error",
        "Hasn't support deeper filter at the moment"
      );
    });
  });

  // describe("with request body", () => {
  //   it("should look up zipcodes with full city name", async () => {
  //     const event = buildRequestBody("city", "Test City23");

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "zips",
  //       full_city_search_result
  //     );
  //   });
  //   it("should look up zipcodes with partial city name", async () => {
  //     const event = buildRequestBody("city", "Test City1");
  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "zips",
  //       partial_city_search_result
  //     );
  //   });

  //   it("should look up zipcodes with full zipcode", async () => {
  //     const event = buildRequestBody("zipcode", "01013");
  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "zips",
  //       full_zip_search_result
  //     );
  //   });

  //   it("should look up zipcodes with partial zipcode", async () => {
  //     const event = buildRequestBody("zipcode", "0101");

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "zips",
  //       partial_zip_search_result
  //     );
  //   });

  //   it("should look up the closest zipcode with the coordinate", async () => {
  //     const event = buildRequestBody("coordinate", [42.45, -72.9]);

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "zips",
  //       closest_zip_result
  //     );
  //   });

  //   it("should filter zipcodes with population", async () => {
  //     const event = buildRequestBody(
  //       "city",
  //       "Test City1",
  //       "estimated_population gt 16000"
  //     );

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "zips",
  //       partial_city_search_result_with_filter
  //     );
  //   });

  //   it("should return error if coordinate out of boundary", async () => {
  //     const event = buildRequestBody("coordinate", [30, -71.9]);

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "error",
  //       "Current verion only support the search within the boundary"
  //     );
  //   });

  //   it("should return error if the parameter is incorrect", async () => {
  //     const event = buildRequestBody("city12", "Test City1");

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "error",
  //       "400 Invalid Input"
  //     );
  //   });
  //   it("should return error if with bad filter", async () => {
  //     const event = buildRequestBody(
  //       "city",
  //       "Test City1",
  //       "estimated_population in 16000"
  //     );

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "error",
  //       "the filter format is incorrect"
  //     );
  //   });

  //   it("should return error if using deeper filter", async () => {
  //     const event = buildRequestBody(
  //       "city",
  //       "Test City1",
  //       "estimated_population gt 16000 and estimated_population lt 26000"
  //     );

  //     await expect(handler(event)).resolves.toHaveProperty(
  //       "error",
  //       "Hasn't support deeper filter at the moment"
  //     );
  //   });
  // });
});
