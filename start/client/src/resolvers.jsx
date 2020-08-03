import gql from "graphql-tag";
import { GET_CART_ITEMS } from "./pages/cart";

/*  The Server has a Schema, so does the Client - typedefs. 

    The "extend" keyword extends types from the Server's Schema.

        isLoggedIn, cartItems, isInCart, etc... are all fields ADDED onto the Server's Schema. 
        These fields are "virtual fields", and used to maintain the client's state and should not be managed by the server.

*/
export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [ID!]!
  }

  extend type Launch {
    isInCart: Boolean!
  }

  extend type Mutation {
    addOrRemoveFromCart(id: ID!): [ID!]!
  }
`;

/* 
    Resolvers are required to resolve the data for the "virtual fields" defined in the schema/typedef above. 

    Not sure why GET_CART_ITEMS ( and all queries for that matter ), are not all defined in their own file/component. 
*/
export const resolvers = {
    Launch: {
      isInCart: (launch, _, { cache }) => {

        // Run the query/fetch against the ... local cache?
        const queryResult = cache.readQuery({
            query: GET_CART_ITEMS
        });
  
        if (queryResult) {
            // Does the launch exist in the result set?
            return queryResult.cartItems.includes(launch.id);
        }

        return false;
      }
    },
    Mutation: {
        // The arguments for a client-side field are similar to that on the server-side; _'s designate unused.
        addOrRemoveFromCart: (_, { id }, { cache }) => {
          const queryResult = cache.readQuery({
            query: GET_CART_ITEMS
          });
    
          if (queryResult) {
            const { cartItems } = queryResult;
            const data = {
              cartItems: cartItems.includes(id)
                ? cartItems.filter(i => i !== id)
                : [...cartItems, id]
            };
    
            // Write to the client cache.
            cache.writeQuery({ query: GET_CART_ITEMS, data });
            return data.cartItems;
          }
          return [];
        }
      }    
  };
