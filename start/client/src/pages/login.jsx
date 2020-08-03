import React from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import gql from "graphql-tag";

import { LoginForm, Loading } from "../components";
//import ApolloClient from "apollo-client";

export const LOGIN_USER = gql`
  mutation login($email: String!) {
    login(email: $email)
  }
`;

export default function Login() {

  /* The Apollo Client is exposed through the entire application using the ApolloProvider on index.jsx, however sometimes 
     it's necessary to call the client directly ... */
  const client = useApolloClient();

  /*  The first value in the useMutation result tuple, login, is a mutate function that actually triggers the mutation when it is called.  */
  const [login, { loading, error }] = useMutation(
                                        /* The Query to invoke. */
                                        LOGIN_USER, {
                                        /* login is the response after invoking the mutation */
                                        onCompleted({ login }) {
                                          /* This will be invoked when the mutation completes. */
                                          
                                          /* Store the Authentication Token to the browser's cache */
                                          localStorage.setItem("token", login);
                                          /* Update the Apollo Cache to notfy that user is logged in. */
                                          client.writeData({ data: { isLoggedIn: true } });
    }
  });

  if (loading) return <Loading />;
  if (error) return <p>An error occurred</p>;

  /* Pass the login mutation function to the LoginForm component as a prop. */
  return <LoginForm login={login} />;
}
