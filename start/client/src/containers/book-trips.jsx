import React from 'react'; 
import { useMutation } from '@apollo/client'; 
import gql from 'graphql-tag';

import Button from '../components/button'; 
import { GET_LAUNCH } from './cart-item'; 
import * as GetCartItemsTypes from '../pages/__generated__/GetCartItems';
import * as BookTripsTypes from './__generated__/BookTrips';

/* Queries used by this component ... 

*/
export const BOOK_TRIPS = gql`
  mutation BookTrips($launchIds: [ID]!) {
    bookTrips(launchIds: $launchIds) {
      success
      message
      launches {
        id
        isBooked
      }
    }
  }
`;

const BookTrips = ({ cartItems }) => {
  
  /* 
    Update the Local Cache using a Mutator 

    bookTrips is a function invoked at a later date by the returned JSX/Markup.
  */
  const [ bookTrips, { data } ] =  useMutation( 
    BOOK_TRIPS,
    {
      variables: { launchIds: cartItems },
      refetchQueries: cartItems.map(launchId => ({
        query: GET_LAUNCH,
        variables: { launchId },
      })),
      update(cache) {
        // Notice that the local cache is being updated, not the Server. 
        cache.writeData({ data: { cartItems: [] } });
      }
    }
  );

  return data && data.bookTrips && !data.bookTrips.success
    ? <p data-testid="message">{data.bookTrips.message}</p>
    : (
      <Button 
        onClick={() => bookTrips()} 
        data-testid="book-button">
        Book All
      </Button>
    );
}

export default BookTrips;