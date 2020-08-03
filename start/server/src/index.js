/* The Apollo Server */

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');

// createStore is a sample Database/Store provided for the tutorial.
const { createStore } = require('./utils');

const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const isEmail = require('isemail');

// Create the Database/Store.
const store = createStore();

// ApolloServer can only accept one schema ( typeDef ). It can accept multiple Datasources/API's however, 
// these API's will make up the Graph Database.
const server = new ApolloServer({
  /* 
    This is called once for every request against the GraphQL Server. It is where you want to perform authentication/authorization.

    "req" is the HTTP request; the authorization header can be parsed and thhe key/token authenticated.

  */
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = req.headers && req.headers.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };
    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = users && users[0] || null;
    return { user: { ...user.dataValues } };
  },  
  /* The Graph Database Schema */
  typeDefs,
  /* The Resolvers the schema will route to to get / update data. */
  resolvers,
  /* These are the datasources / APIs in the Graph Database */
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});