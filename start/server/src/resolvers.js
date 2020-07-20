/*  
    A Resolver transforms data from the Datasource(s) to the Schema on a field-by-field basis.

    A Resolver describes how Types declared on the Schema are populated; usually this is done using a Datasource. Each property and method for a Schema Type
    has a corresponding resolver.

    A Resolver will make an attempt at resolving nested fields/objects, sometimes ( for enumerations for example ), you will need to explicitly define a [ nested ] Resolver.

    A resolver has four arguments : parent, args, context, and info; _ and __ are positional placeholder for unused arguments. 
*/    

const { paginateResults } = require('./utils');

module.exports = {
    Query: {
        /* An object is send in for the third argument, destructuring, or {} parses onlf the datasource field from the object */
        launches: async (_, { pageSize = 20, after }, { dataSources }) => {
            const allLaunches = await dataSources.launchAPI.getAllLaunches();
            // we want these in reverse chronological order
            allLaunches.reverse();
            const launches = paginateResults({
              after,
              pageSize,
              results: allLaunches
            });
            return {
              launches,
              cursor: launches.length ? launches[launches.length - 1].cursor : null,
              // if the cursor at the end of the paginated results is the same as the
              // last item in _all_ results, then there are no more results after this
              hasMore: launches.length
                ? launches[launches.length - 1].cursor !==
                  allLaunches[allLaunches.length - 1].cursor
                : false
            };
          },
        launch: (_, { id }, { dataSources }) =>
        /* Another use of destructuring; an object is sent as an argument but only id is parsed */
            dataSources.launchAPI.getLaunchById({ launchId: id }),
        me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
    },
    Mission: {
        // The default size is 'LARGE' if not provided
        missionPatch: (mission, { size } = { size: 'LARGE' }) => {
          return size === 'SMALL'
            ? mission.missionPatchSmall
            : mission.missionPatchLarge;
        },
    },   
    Launch: {
        isBooked: async (launch, _, { dataSources }) =>
            dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
    },
    User: {
        trips: async (_, __, { dataSources }) => {
          // get ids of launches by user
          const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
          if (!launchIds.length) return [];
          // look up those launches by their ids
          return (
            dataSources.launchAPI.getLaunchesByIds({
              launchIds,
            }) || []
          );
        },
      }       
  };