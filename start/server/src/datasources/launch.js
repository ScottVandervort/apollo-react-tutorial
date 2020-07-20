/* The Launch API, will be part of the Graph Database hosted by the Apollo Server */


// Apollo component for accessing REST Datasources.
// Apollo automatically caches the results.
const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();

    // 'baseUrl' is inherited from RESTDataSource.
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  // Transform the GET response; can be into the Graph Schema ( like a Resolver ), but doesn't have to be.
  // 'cursor' is an additional field used for pagination; it does not belong to the schema.
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }

  // Asynchronously GET's a launch from the baseURL's 'launches' resource; returns a Promise.
  // The curly brackets is 'destructring'. The function assumes an object is being sent in as an argument from which 'launchID' will be parsed, if not NULL.
  async getLaunchById({ launchId }) {

    // Wait for a response, getLaunchByID will return a Promise in the meantime.
    const response = await this.get('launches', { flight_number: launchId });

    // Transform the response from the data source using the reducer.
    return this.launchReducer(response[0]);
  }
  
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId })),
    );
  }  

  // A Javascript function with the async keyword always returns a promise, so getAllLaunches.then( (result) => { /* Do Something */ }) )
  async getAllLaunches() {

    // 'get()' is inherited from RESTDataSource, it sends a GET request to the baseURL's 'launches' resource.
    // The await keyword will wait for a response, in the meantime a promise will be returned from getAllLaunches().
    const response = await this.get('launches');

    // launchReducer() is called to transform the GET response into Schema defined in /src/schema.js
    return Array.isArray(response)
      ? response.map(launch => this.launchReducer(launch))
      : [];
  }  
}

module.exports = LaunchAPI;