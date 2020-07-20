# Apollo tutorial

This is the fullstack app for the [Apollo tutorial](http://apollographql.com/docs/tutorial/introduction.html). 🚀

## File structure

The app is split out into two folders:
- `start`: Starting point for the tutorial
- `final`: Final version

From within the `start` and `final` directories, there are two folders (one for `server` and one for `client`).

## Installation

To run the app, run these commands in two separate terminal windows from the root:

```bash
cd final/server && npm i && npm start
```

and

```bash
cd final/client && npm i && npm start
```

## GraphQL Playground
Once the server is running can use the web-based GraphQL Playground to browse the schema and run queries.
[Graph QL Playground](http://localhost:4000/)

## GraphQL Queries
In a GraphQL query the query name ( ex: "GetLaunches" ) is arbitrary, it doesn't correspond to the queries declared in the Schema. "launches", however, DOES correspond to the query declared in the Schema. The stuff in the brackets defines what you want returned.
'''
query GetLaunches {
  launches {
    id
    mission {
      name
    }
  }
}
'''

Variables can be parameterized, too....
'''
query GetLaunchById {
  launch(id: 60) {
    id
    rocket {
      id
      type
    }
  }
}

query GetLaunchById($id: ID!) {
  launch(id: $id) {
    id
    rocket {
      id
      type
    }
  }
}
'''
... this would be how you specify a value for the variable.
'''
{
  "id": 60
}
'''

## Tutorials

https://www.apollographql.com/docs/apollo-server/testing/mocking/

https://www.apollographql.com/docs/tutorial/data-source/

Here: https://www.apollographql.com/docs/tutorial/mutation-resolvers/