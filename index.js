
const { ApolloServer } = require('apollo-server-express');
const resolvers = require('./server/schema/graphql/resolvers');
const typeDefs = require('./server/schema/graphql/typeDefs');
const express = require('express');
const models = require('./server/models');
// const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const contextMiddleware = require('./server/schema/util/contextMiddleware');
const http = require('http');
const app = express();

// Replace with your mongoLab URI
const MONGO_URI = 'mongodb://localhost:27017/chatDemodb';
if (!MONGO_URI) {
  throw new Error('You must provide a local MongoDB URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI); 
mongoose.connection
    .once('open', () => console.log('Connected to local MongoDB instance.'))
    .on('error', error => console.log('Error connecting to MongoDB:', error));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  context: contextMiddleware,
})

server.applyMiddleware({app})

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(4000, ()=>{
  console.log(`Graphql server is running on port: 4000`);
});


const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
app.use(webpackMiddleware(webpack(webpackConfig)));

module.exports = app;
