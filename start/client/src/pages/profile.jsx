import React, { Fragment } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { Loading, Header, LaunchTile } from "../components";
import { LAUNCH_TILE_DATA } from "./launches";

/* These are the queries we will use against GraphQL ..... */

/* Uses the same LaunchTile fragment as the launches page / component. */
export const GET_MY_TRIPS = gql`
  query GetMyTrips {
    me {
      id
      email
      trips {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;

/* The Profile Component / Page */
const Profile = () => {

  const { data, loading, error } = useQuery(
                                    GET_MY_TRIPS,
                                    /*  network-only - instructs Apollo to get fresh data and update cahce in the process. 
                                        cache-first - instructs Apollo to always read from the cache and only fetch new data if it doesn't exist. 
                                        cache-network - instructs Apollo to use what is already cached, but update the cache asynchornously.
                                        no-cache - instructs Apollo to ignore the cache altogether and always fetch.
                                    */
                                    { fetchPolicy: "network-only" });
  
  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;
  if (data === undefined) return <p>ERROR</p>;

  return (
    <Fragment>
      <Header>My Trips</Header>
      {data.me && data.me.trips.length ? (
        /* Create a LaunchTile element for each trip ... */
        data.me.trips.map(launch => (
          <LaunchTile key={launch.id} launch={launch} />
        ))
      ) : (
        <p>You haven't booked any trips</p>
      )}
    </Fragment>
  );
};

export default Profile;