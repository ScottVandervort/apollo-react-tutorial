import React, { Fragment } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { Loading, Header, LaunchDetail } from "../components";
import { ActionButton } from "../containers";

import { LAUNCH_TILE_DATA } from "./launches";

/* These are the queries we will use against GraphQL ..... */

/* The OLD query, before implementing a fragment. */
// export const OLD_GET_LAUNCH_DETAILS = gql`
//   query LaunchDetails($launchId: ID!) {
//     launch(id: $launchId) {
//       id
//       site
//       isBooked
//       rocket {
//         id
//         name
//         type
//       }
//       mission {
//         name
//         missionPatch
//       }
//     }
//   }
// `;

/* The NEW query which uses the same LaunchTile fragment as the launches page / component. */
// export const GET_LAUNCH_DETAILS = gql`
//   query LaunchDetails($launchId: ID!) {
//     launch(id: $launchId) {
//       site
//       rocket {
//         type
//       }
//       ...LaunchTile
//     }
//   }
//   ${LAUNCH_TILE_DATA}
// `;

/*  An even NEWER query which includes the client/cache/virtual isInCart field; note the @client directive. 
    The isInCart is resolved in the client resolvers.
*/
export const GET_LAUNCH_DETAILS = gql`
  query LaunchDetails($launchId: ID!) {
    launch(id: $launchId) {
      isInCart @client
      site
      rocket {
        type
      }
      ...LaunchTile
    }
  }
  ${LAUNCH_TILE_DATA}
`;

/* Launch Component */
const Launch = ({ launchId }) => {
  const { data, 
          loading, 
          error } = useQuery(
                      GET_LAUNCH_DETAILS, 
                      {
                        variables: { launchId } 
                      });

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;
  if (!data) return <p>Not found</p>;

  return (
    <Fragment>
      <Header
        image={
          /*
            More unreadable but clever code.
            Apparent multiple &&'s will return the value of the last && if it's not 0, null, false, or undefined.
          */
          data.launch && data.launch.mission && data.launch.mission.missionPatch
        }
      >
        {data && data.launch && data.launch.mission && data.launch.mission.name}
      </Header>
      
      <LaunchDetail {/* Spread the properties of data.launch as props to the LaunchDetail component */ ...data.launch} />
      <ActionButton {...data.launch} />
    </Fragment>
  );
};

export default Launch;