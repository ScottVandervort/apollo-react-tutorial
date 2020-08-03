import { ApolloClient } from "apollo-client";
import { useQuery } from "@apollo/client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider } from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import Login from "./pages/login"
import injectStyles from "./styles";
import { resolvers, typeDefs } from "./resolvers";
import gql from "graphql-tag";

/* Queries used by the the Root 

    isLoggedIn calls the "isLoggedIn" query decleared in the client-side typedefs/resolvers.

   The @client directive tells Apollo to query the local/client cache; to NOT query the server.
*/
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

/* 
  Returns wither the Log On page or the Application based upon whether or not the user is loged in.

  IsLoggedIn is essentially a component, it returns JSX and, as such, can be rendered using <IsLoggedIn>

*/
function IsLoggedIn() {
  const { data } = useQuery(IS_LOGGED_IN);
  
  return data.isLoggedIn ? <Pages /> : <Login />;
}

// Apollo can be configured to cache queries.
const apolloCache = new InMemoryCache();

const apolloServerUri = new HttpLink({
  uri: "http://localhost:4000/",
  /* Pull the autnentciation token out of LocalStorage; it was put there in Login.jsx after the login mutation/function was called. */
  headers: { authorization: localStorage.getItem('token') }
});

// Create an Apollo Client and connect to server at Port 4000.
const apolloClient = new ApolloClient({
  cache:apolloCache,
  link:apolloServerUri,
  typeDefs : typeDefs,
  resolvers : resolvers

});

apolloCache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem('token'),
    cartItems: [],
  }
});

injectStyles();

// Wrap the React application in the ApolloProvider, this will make the client accessible anywhere.
// IsLoggedIn will render the correct JSX/Markup baed upon whether or not the user is logged in.

// ReactDOM.render(
//   <ApolloProvider client={apolloClient}>
//     <Pages />
//   </ApolloProvider>,
//   document.getElementById("root")
// );

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <IsLoggedIn/>
  </ApolloProvider>,
  document.getElementById("root")
);



// gql`
// query GetLaunch {
//   launch(id: 56) {
//     id
//     mission {
//       name
//     }
//   }
// }
// `

// // ... above is the instantiation of the client object.
// client
//   .query({
//     query: gql`
//       query GetLaunch {
//         launch(id: 56) {
//           id
//           mission {
//             name
//           }
//         }
//       }
//     `
//   })
//   .then(result => console.log(result));