import React, { Fragment } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { LaunchTile, Header, Button, Loading } from "../components";

/* A fragment is a set of fields that can be resued across queries to cut down on size. */
export const LAUNCH_TILE_DATA = gql`
  fragment LaunchTile on Launch {
    __typename
    id
    isBooked
    rocket {
      id
      name
    }
    mission {
      name
      missionPatch
    }
  }
`;

/* These are the queries we will use against GraphQL ..... */

/* ... this is the OLD query before using a fragment. */
const GET_LAUNCHES_OLD = gql`
  query launchList($after: String) {
    launches(after: $after) {
      cursor
      hasMore
      launches {        
        id
        isBooked
        rocket {
          id
          name
        }
        mission {
          name
          missionPatch
        }
      }
    }
  }
`;

/* This is the NEW query; it uses a fragment, LaunchTile. Notice it uses the spread (...) operator to expand the properties.  */
const GET_LAUNCHES = gql`
  query launchList($after: String) {
    launches(after: $after) {
      cursor
      hasMore
      launches {        
        ...LaunchTile          
      }
    }
  }
  ${LAUNCH_TILE_DATA}  
`;

/* Launches Component */
const Launches = () => {

  
  /* Get data from the GraphQL Server */
  const { data, 
          loading, 
          error, 
          fetchMore } = useQuery(GET_LAUNCHES);

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  /* Return markup */
  return (

    /* React can only return 1 elelemnt, <Fragment/> is used to group together 2+ elements */ 
    <Fragment>
      <Header />

      {data.launches &&
        data.launches.launches &&
        /* For each launch render a Tile ... */
        data.launches.launches.map(launch => (
          <LaunchTile key={launch.id} launch={launch} />
        ))}
      {data.launches && 
        data.launches.hasMore && (
          <Button
            onClick={() =>

              /* On button click call fetchMore() which was returned by useQuery() above ). */
              fetchMore({
                variables: {
                  after: data.launches.cursor,
                },
                updateQuery: (prev, { fetchMoreResult, ...rest }) => {
                  
                  /* If no more results, return the previous result set. */
                  if (!fetchMoreResult) return prev;

                  /* ... else, return the aggregated results. This is an unreadable hot mess.
                  
                    First, the spread ( ... ) operator deconstructs an object; it extracts the name/value pairs and merges them with other name/value pairs in the same object/array. 

                    Next, fetchMoreResults and prev have this structure :

                    {
                      launches : {
                        cursor : ...
                        hasMore : ...,
                        launches : []
                      }
                    }

                    What this godforsaken statement does is return the same structure, but it merges the launches arrays from fetchMoreResults and prev.
                  
                  */
                  return {
                    ...fetchMoreResult,
                    launches: {
                      ...fetchMoreResult.launches,
                      launches: [
                        ...prev.launches.launches,
                        ...fetchMoreResult.launches.launches,
                      ],
                    },
                  };
                },
              })
            }
          >
            Load More
          </Button>
        )
      }

    </Fragment>
  );
};

export default Launches;