import React, { Fragment } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { Header, Loading } from "../components";
import { CartItem, BookTrips } from "../containers";

/* Queries used by this page.

    cartItems calls the "cartItems" query decleared in the client-side typedefs/resolvers.

    The @client directive tells Apollo to query the local/client cache; to NOT query the server.
*/
export const GET_CART_ITEMS = gql`
  query GetCartItems {
    cartItems @client
  }
`;

const Cart = () => {
  const { data, loading, error } = useQuery(GET_CART_ITEMS);

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <Fragment>
      <Header>My Cart</Header>
      {!data || (!!data && data.cartItems.length === 0) ? (
        <p data-testid="empty-message">No items in your cart</p>
      ) : (
        <Fragment>
          {!!data &&
            data.cartItems.map(launchId => (
              <CartItem key={launchId} launchId={launchId} />
            ))}

          <BookTrips cartItems={!!data ? data.cartItems : []} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default Cart;