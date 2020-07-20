/* The Apollo Server */

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');

// createStore is a sample Database/Store provided for the tutorial.
const { createStore } = require('./utils');

const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

// Create the Database/Store.
const store = createStore();

// ApolloServer can only accept one schema ( typeDef ). It can accept multiple API's however, 
// these API's will make up the Graph Database.
const server = new ApolloServer({
  /* !!!! The Graph Database can only have one unifying schema */
  typeDefs,
  /* !!!! By default, Apollo only supports a single unifying Resolver for the entire Server.. */
  resolvers,
  /* These are the datasources in the Graph Database */
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});