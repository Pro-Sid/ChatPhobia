const userResolvers = require('./users');
const messageResolvers = require('./messages');
const mongoose = require('mongoose');
const models = require('../../../models');
const User = mongoose.model('user');
const Message = mongoose.model('message');

module.exports = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  User: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: { 
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
    ...userResolvers.Subscription
  },
}