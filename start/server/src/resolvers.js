/*  

    Requests against the Schema are routed to Resolvers. Resolver retreive ( or modify ) data from the Datasource(s). A Resolver exists for each property/field of a type. 
    
    Only the properties/fields of the Query and Mutation types can be invoked directly from the GraphQL API. The other types and corresponding fields are used to define and resolve the response.
    
    A Resolver has four arguments : parent, args, context, and info; _ and __ are positional placeholder for unused arguments.     

      "parent" is the object to which the field belongs.

      "args" are arguments sent in from the consumer's query 

      "context" is a hodgepodge of stuff pertaining to the server containing at least the datasources/APIs
*/    

const { paginateResults } = require('./utils');

module.exports = {
    Query: {
        /* An objects are sent in for the 2nd and thrid arguments. Destructuring, or {} parses onlf the datasource field from the object.
           "pageSize" and "after" are sent in as arguments from query      
        */
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
    Mutation: {
      login: async (_, { email }, { dataSources }) => {
        const user = await dataSources.userAPI.findOrCreateUser({ email });
        if (user) return Buffer.from(email).toString('base64');
      },
      bookTrips: async (_, { launchIds }, { dataSources }) => {
        const results = await dataSources.userAPI.bookTrips({ launchIds });
        const launches = await dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        });
    
        return {
          success: results && results.length === launchIds.length,
          message:
            results.length === launchIds.length
              ? 'trips booked successfully'
              : `the following launches couldn't be booked: ${launchIds.filter(
                  id => !results.includes(id),
                )}`,
          launches,
        };
      },
      cancelTrip: async (_, { launchId }, { dataSources }) => {
        const result = await dataSources.userAPI.cancelTrip({ launchId });
    
        if (!result)
          return {
            success: false,
            message: 'failed to cancel trip',
          };
    
        const launch = await dataSources.launchAPI.getLaunchById({ launchId });
        return {
          success: true,
          message: 'trip cancelled',
          launches: [launch],
        };
      }      
    },    
    Mission: {
        // Size is an argument sent in from The default size is 'LARGE' if not provided
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